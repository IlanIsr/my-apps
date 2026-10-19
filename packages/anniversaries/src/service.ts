/**
 * Orchestration: Neon Postgres (via `store.ts`) is the source of truth, Google
 * Calendar is a sync target. Every mutation writes the store, then reconciles
 * the calendar, then records the members in `users` (best-effort).
 *
 * This is the API app-1 consumes (via `app/anniversaries/actions.ts`). Callers
 * pass the signed-in user's email + Clerk id + a pre-translated event
 * `summary`; this package does no auth and no i18n.
 */

import { createHash } from "node:crypto";

import {
  calculateNextOccurrences,
  getTsetHakohavimWithFallback,
  type HebrewMonthKey,
} from "@repo/hebcal";
import { uniqueLowercased } from "@repo/utils";

import {
  CalendarRateLimitError,
  isCalendarReachable,
  patchEvent,
  syncPersonEvents,
} from "./calendar";
import {
  formatHebDateLabel,
  anniversaryKey,
  type Anniversary,
  type AnniversaryEvent,
  type AnniversaryType,
} from "./person";
import {
  createPerson,
  currentDatabaseUrl,
  findByKey,
  getEmailSentState,
  getPerson,
  isStoreConfigured,
  listPersons,
  listPersonsFrom,
  markEmailSent,
  prodDatabaseUrl,
  replaceAllPersons,
  storeConfigIssues,
  updatePerson,
  upsertUser,
  DatabaseNotConfiguredError,
  type PersonRecord,
  type StoredEvent,
} from "./store";
import {
  createShareLink as insertShareLink,
  getShareLink as fetchShareLink,
} from "./share-links";

export { CalendarNotConfiguredError, CalendarRateLimitError } from "./calendar";
export {
  DatabaseNotConfiguredError,
  // Back-compat alias — callers historically caught `StoreNotConfiguredError`.
  StoreNotConfiguredError,
} from "./store";

export class NoSuchHebrewDateError extends Error {
  constructor() {
    super("no-such-hebrew-date");
    this.name = "NoSuchHebrewDateError";
  }
}

const MAX_YEARS = 50;

const DEFAULT_ADMIN_EMAIL = "anniversaries.calendar@gmail.com";

/** Google Calendar colour id per anniversary type. */
function colorIdFor(type: AnniversaryType): string {
  return type === "yahrzeit" ? "9" : "6"; // Blueberry / Tangerine
}

/**
 * Whether `email` belongs to an anniversaries admin (the shared account).
 * Configured via `ANNIVERSARIES_ADMIN_EMAILS` (comma-separated); defaults to
 * the shared bot account.
 */
export function isAnniversariesAdmin(email: string): boolean {
  const raw = process.env.ANNIVERSARIES_ADMIN_EMAILS || DEFAULT_ADMIN_EMAIL;
  const admins = raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.trim().toLowerCase());
}

function todayISO(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function toAnniversary(record: PersonRecord, viewerEmail: string): Anniversary {
  const email = viewerEmail.toLowerCase();
  const admin = isAnniversariesAdmin(viewerEmail);
  const today = todayISO();
  const events: AnniversaryEvent[] = record.events
    .filter((e) => e.googleEventId && e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((e) => ({
      id: e.googleEventId,
      year: e.year,
      date: e.date,
      time: e.time || undefined,
      htmlLink: e.htmlLink || undefined,
    }));
  return {
    id: record.id,
    name: record.name,
    type: record.type,
    hebrewName: record.hebrewName,
    origin: record.origin,
    hebYear: record.hebYear,
    hebDate: record.hebDate,
    hebDateLabel: formatHebDateLabel(record.hebDate),
    // Never hand other members' addresses to a non-admin viewer.
    members: admin ? [...record.members].sort() : [],
    joined: record.members.includes(email),
    admin,
    events,
  };
}

/**
 * The events a person should have: the next `years` occurrences, carrying over
 * any manual per-event edits and known Google event ids from `record`.
 */
function desiredStored(
  record: PersonRecord | null,
  hebDay: number,
  hebMonth: string,
  years: number,
): StoredEvent[] {
  const priorByYear = new Map<number, StoredEvent>();
  for (const e of record?.events ?? []) priorByYear.set(e.year, e);

  return calculateNextOccurrences(hebDay, hebMonth, years).map((o) => {
    const prev = priorByYear.get(o.hebrewYear);
    if (prev?.manual) return prev;
    return {
      year: o.hebrewYear,
      date: o.date,
      time: "",
      googleEventId: prev?.googleEventId ?? "",
      htmlLink: prev?.htmlLink ?? "",
    };
  });
}

function applySynced(
  base: StoredEvent[],
  synced: {
    year: number;
    date: string;
    time: string;
    googleEventId: string;
    htmlLink: string;
  }[],
): StoredEvent[] {
  const byYear = new Map(synced.map((s) => [s.year, s]));
  return base.map((e) => {
    const s = byYear.get(e.year);
    if (!s) return e;
    return {
      ...e,
      date: s.date,
      time: s.time,
      googleEventId: s.googleEventId,
      htmlLink: s.htmlLink,
    };
  });
}

/**
 * Whether the anniversaries feature is available: the Postgres store is
 * configured (`DATABASE_URL`) and the shared Google Calendar is reachable.
 */
export async function isCalendarConfigured(): Promise<boolean> {
  const missing = storeConfigIssues();
  if (missing.length > 0) {
    console.error(
      `[anniversaries] Database not configured: missing ${missing.join(", ")}`,
    );
    return false;
  }
  return isCalendarReachable();
}

/**
 * The anniversaries a viewer may see in the list / agenda: only the ones they're
 * on the family list for. The admin (shared account) sees all of them — that's
 * what the member counts / "Family on this date" view are for.
 *
 * Direct access to a single person by id ({@link getAnniversary}) is *not*
 * filtered, so a shared link still lets someone open and join an existing
 * person.
 */
export async function listAnniversaries(
  viewerEmail: string,
): Promise<Anniversary[]> {
  const email = viewerEmail.toLowerCase();
  const admin = isAnniversariesAdmin(viewerEmail);
  const records = await listPersons();
  return records
    .filter((r) => admin || r.members.includes(email))
    .map((r) => toAnniversary(r, viewerEmail))
    .sort((a, b) =>
      (a.events[0]?.date ?? "").localeCompare(b.events[0]?.date ?? ""),
    );
}

export async function getAnniversary(
  id: string,
  viewerEmail: string,
): Promise<Anniversary | null> {
  const record = await getPerson(id);
  return record ? toAnniversary(record, viewerEmail) : null;
}

export type AddAnniversaryInput = {
  name: string;
  type: AnniversaryType;
  hebDay: number;
  hebMonth: string;
  years: number;
  hebrewName?: string;
  origin?: string;
  /** Hebrew year of birth / passing. Optional. */
  hebYear?: number;
  /** Pre-translated event title. */
  summary: string;
  /** Clerk id of the signed-in user. */
  createdBy: string;
};

/**
 * Record every member email as a known user, and (best-effort) don't let a
 * users-table hiccup fail the whole mutation — the calendar sync already
 * succeeded by the time this runs.
 */
async function recordMembers(
  emails: string[],
  viewerEmail: string,
  viewerClerkId: string,
  notifiedEmails: string[],
): Promise<void> {
  const lower = viewerEmail.toLowerCase();
  try {
    await Promise.all(
      emails.map((e) =>
        upsertUser({
          email: e,
          clerkId: e === lower ? viewerClerkId : undefined,
        }),
      ),
    );
    if (notifiedEmails.length > 0) await markEmailSent(notifiedEmails);
  } catch (error) {
    console.error("[anniversaries] recording users failed:", error);
  }
}

/**
 * Create a person + their events, or — if a matching person exists — add the
 * current user and top up missing future years.
 */
export async function addAnniversary(
  input: AddAnniversaryInput,
  viewerEmail: string,
): Promise<{ created: number; joined: boolean }> {
  if (!isStoreConfigured()) throw new DatabaseNotConfiguredError();

  const email = viewerEmail.toLowerCase();
  // The signed-in user's own invite is automatic — notify them the first
  // time (before they've ever accepted the shared calendar), then stop.
  const creatorState = await getEmailSentState([email]);
  const notifyEmails = creatorState.get(email) ? [] : [email];
  const years = Math.min(
    MAX_YEARS,
    Math.max(1, Number.isFinite(input.years) ? Math.floor(input.years) : 1),
  );
  const colorId = colorIdFor(input.type);
  const key = anniversaryKey(
    input.name,
    input.hebDay,
    input.hebMonth,
    input.type,
  );
  const existing = await findByKey(key);

  if (!existing) {
    const base = desiredStored(null, input.hebDay, input.hebMonth, years);
    if (base.length === 0) throw new NoSuchHebrewDateError();

    const members = [email];
    const record = await createPerson({
      name: input.name.trim(),
      type: input.type,
      hebrewName: input.hebrewName?.trim() || undefined,
      origin: input.origin?.trim() || undefined,
      hebYear: input.hebYear,
      hebDate: { day: input.hebDay, month: input.hebMonth as HebrewMonthKey },
      members,
      createdBy: input.createdBy,
    });

    const sync = await syncPersonEvents({
      personId: record.id,
      summary: input.summary,
      summaryFallback: record.name,
      description: "",
      colorId,
      members,
      events: base.map(toDesired),
      notifyEmails,
    });
    const finalMembers = members.filter((m) => !sync.declined.includes(m));
    await updatePerson(record.id, {
      members: finalMembers,
      events: applySynced(base, sync.events),
    });
    await recordMembers(
      finalMembers,
      email,
      input.createdBy,
      notifyEmails.filter((e) => finalMembers.includes(e)),
    );
    if (sync.rateLimited) throw new CalendarRateLimitError();
    return {
      created: sync.events.length,
      joined: finalMembers.includes(email),
    };
  }

  const members = uniqueLowercased([...existing.members, email]);
  const base = desiredStored(
    existing,
    input.hebDay,
    input.hebMonth,
    Math.max(years, existing.events.length),
  );
  const priorIds = new Set(
    existing.events.map((e) => e.googleEventId).filter(Boolean),
  );

  const sync = await syncPersonEvents({
    personId: existing.id,
    summary: input.summary,
    summaryFallback: existing.name,
    description: "",
    colorId,
    members,
    events: base.map(toDesired),
    notifyEmails,
  });
  // A declined guest has effectively left. The person + events still stay on
  // the shared calendar — only the shared account itself removes an event.
  const finalMembers = members.filter((m) => !sync.declined.includes(m));

  await updatePerson(existing.id, {
    members: finalMembers,
    events: applySynced(base, sync.events),
  });
  await recordMembers(
    finalMembers,
    email,
    input.createdBy,
    notifyEmails.filter((e) => finalMembers.includes(e)),
  );
  if (sync.rateLimited) throw new CalendarRateLimitError();
  const created = sync.events.filter(
    (e) => !priorIds.has(e.googleEventId),
  ).length;
  return { created, joined: finalMembers.includes(email) };
}

function toDesired(e: StoredEvent) {
  return {
    year: e.year,
    date: e.date,
    time: e.manual ? e.time : "",
    googleEventId: e.googleEventId,
  };
}

/**
 * Remove the user from a person's list. The person + their events always stay
 * on the shared calendar (even with zero members) — only the shared account
 * itself ever deletes an event.
 */
export async function leaveAnniversary(
  id: string,
  viewerEmail: string,
): Promise<{ removed: number; deleted: number }> {
  const email = viewerEmail.toLowerCase();
  const person = await getPerson(id);
  if (!person || !person.members.includes(email)) {
    return { removed: 0, deleted: 0 };
  }

  const members = person.members.filter((m) => m !== email);

  const sync = await syncPersonEvents({
    personId: id,
    summaryFallback: person.name,
    colorId: colorIdFor(person.type),
    members,
    events: person.events.map(toDesired),
  });
  const finalMembers = members.filter((m) => !sync.declined.includes(m));

  await updatePerson(id, {
    // On a partial sync, keep the old member list so a retry re-runs the whole
    // removal rather than skipping it (the early `includes(email)` check).
    members: sync.rateLimited ? person.members : finalMembers,
    events: applySynced(person.events, sync.events),
  });
  if (sync.rateLimited) throw new CalendarRateLimitError();
  return { removed: 1, deleted: 0 };
}

/**
 * Add `target` as a member of `person` and (re)sync the calendar so they're
 * invited (`sendUpdates=all`). Shared by every "join" path — the only one
 * left is {@link joinShareLink}, where `target` is always the signed-in
 * viewer themselves, never an address someone else typed.
 */
async function addMemberToCalendar(
  person: PersonRecord,
  target: { email: string; userId: string },
  summary: string,
): Promise<{ added: boolean; rateLimited: boolean }> {
  const members = uniqueLowercased([...person.members, target.email]);
  const notifyEmails = [target.email];
  const sync = await syncPersonEvents({
    personId: person.id,
    summary,
    summaryFallback: person.name,
    description: "",
    colorId: colorIdFor(person.type),
    members,
    events: person.events.map(toDesired),
    notifyEmails,
  });
  const finalMembers = members.filter((m) => !sync.declined.includes(m));

  await updatePerson(person.id, {
    members: finalMembers,
    events: applySynced(person.events, sync.events),
  });
  await recordMembers(
    [target.email],
    target.email,
    target.userId,
    notifyEmails.filter((e) => finalMembers.includes(e)),
  );

  return {
    added: finalMembers.includes(target.email),
    rateLimited: sync.rateLimited,
  };
}

export type ShareLinkPreviewItem = {
  id: string;
  name: string;
  type: AnniversaryType;
  hebDateLabel: string;
  /** The viewer is already a member — show it pre-checked and disabled. */
  alreadyJoined: boolean;
};

/**
 * Generate a 24h-reusable link covering `personIds`. The viewer must already
 * be a member (or admin) of every one of them — sharing something you don't
 * belong to isn't allowed.
 */
export async function createShareLink(
  personIds: string[],
  viewerEmail: string,
): Promise<{ id: string; expiresAt: Date }> {
  if (!isStoreConfigured()) throw new DatabaseNotConfiguredError();

  const email = viewerEmail.toLowerCase();
  const admin = isAnniversariesAdmin(viewerEmail);
  const ids = [...new Set(personIds)];
  if (ids.length === 0) throw new Error("no-anniversaries-selected");

  for (const id of ids) {
    const person = await getPerson(id);
    if (!person || (!person.members.includes(email) && !admin)) {
      throw new Error("not-a-member");
    }
  }

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const link = await insertShareLink({
    createdBy: email,
    personIds: ids,
    expiresAt,
  });
  return { id: link.id, expiresAt };
}

/**
 * What a share link's recipient sees before joining: never reveals
 * `members` (admin-only elsewhere) — just enough to decide what to join.
 * The link id is the only credential checked, same trust model as
 * {@link getAnniversary}.
 */
export async function getShareLinkPreview(
  id: string,
  viewerEmail: string,
): Promise<{ expired: boolean; items: ShareLinkPreviewItem[] } | null> {
  const link = await fetchShareLink(id);
  if (!link) return null;

  const email = viewerEmail.toLowerCase();
  const expired = Date.now() > link.expiresAt.getTime();
  const items: ShareLinkPreviewItem[] = [];
  for (const personId of link.personIds) {
    const person = await getPerson(personId);
    if (!person) continue; // deleted since the link was created
    items.push({
      id: person.id,
      name: person.name,
      type: person.type,
      hebDateLabel: formatHebDateLabel(person.hebDate),
      alreadyJoined: person.members.includes(email),
    });
  }
  return { expired, items };
}

/**
 * Join a subset of a share link's anniversaries as the signed-in viewer —
 * always self, never an address typed by whoever created the link. Requested
 * ids are intersected with the link's own list; nothing outside it is ever
 * touched.
 */
export async function joinShareLink(
  id: string,
  personIds: string[],
  viewer: { email: string; userId: string },
  summaryFor: (type: AnniversaryType, name: string) => string,
): Promise<{
  joined: string[];
  alreadyJoined: string[];
  failed: string[];
  rateLimited: boolean;
}> {
  if (!isStoreConfigured()) throw new DatabaseNotConfiguredError();

  const link = await fetchShareLink(id);
  const joined: string[] = [];
  const alreadyJoined: string[] = [];
  const failed: string[] = [];
  if (!link || Date.now() > link.expiresAt.getTime()) {
    return { joined, alreadyJoined, failed, rateLimited: false };
  }

  const email = viewer.email.toLowerCase();
  const wanted = new Set(personIds);
  const ids = link.personIds.filter((pid) => wanted.has(pid));

  for (const personId of ids) {
    const person = await getPerson(personId);
    if (!person) {
      failed.push(personId);
      continue;
    }
    if (person.members.includes(email)) {
      alreadyJoined.push(personId);
      continue;
    }
    try {
      const summary = summaryFor(person.type, person.name);
      const result = await addMemberToCalendar(
        person,
        { email, userId: viewer.userId },
        summary,
      );
      if (result.added) joined.push(personId);
      else failed.push(personId);
      if (result.rateLimited) {
        return { joined, alreadyJoined, failed, rateLimited: true };
      }
    } catch (error) {
      if (error instanceof CalendarRateLimitError) {
        return { joined, alreadyJoined, failed, rateLimited: true };
      }
      console.error(
        `[anniversaries] join-share-link failed for ${personId}:`,
        error,
      );
      failed.push(personId);
    }
  }

  return { joined, alreadyJoined, failed, rateLimited: false };
}

export type UpdateEventInput = {
  /** `persons.id`. */
  id: string;
  /** Google Calendar event id. */
  eventId: string;
  date: string;
  time?: string;
  /** Pre-translated event title. */
  summary: string;
};

/** A manual per-event edit: change one occurrence's date and/or time. */
export async function updateEvent(input: UpdateEventInput): Promise<void> {
  const person = await getPerson(input.id);
  if (!person) return;
  const target = person.events.find((e) => e.googleEventId === input.eventId);
  if (!target) return;

  const time =
    input.time?.trim() || (await getTsetHakohavimWithFallback(input.date));

  const { htmlLink } = await patchEvent({
    googleEventId: input.eventId,
    date: input.date,
    time,
    summary: input.summary,
    description: "",
  });

  const events = person.events.map((e) =>
    e.googleEventId === input.eventId
      ? { ...e, date: input.date, time, htmlLink, manual: true }
      : e,
  );
  await updatePerson(input.id, { events });
}

export type UpdatePersonInput = {
  id: string;
  /** New display name. Omit to leave unchanged. */
  name?: string;
  type?: AnniversaryType;
  /** Omit either to leave the Hebrew date unchanged. Changing it regenerates
   * every stored occurrence (same count as today) at the new date. */
  hebDay?: number;
  hebMonth?: string;
  /** `""` clears it. Omit to leave unchanged. */
  hebrewName?: string;
  /** `""` clears it. Omit to leave unchanged. */
  origin?: string;
  /** `0` / `NaN` clears it. Omit to leave unchanged. */
  hebYear?: number;
  /**
   * Pre-translated event title for the (possibly new) name + type — used only
   * if name, type, or the Hebrew date actually changed.
   */
  summary: string;
};

/**
 * Edit a person's details. Name / type changes recompute the dedup `key`, the
 * calendar event titles and (for type) the colour. A Hebrew date change also
 * recomputes the key and regenerates every stored occurrence (preserving manual
 * per-event overrides and existing Google event ids, so those are PATCHed in
 * place rather than left stale on the calendar). Any of these trigger a
 * calendar re-sync. hebrewName / origin / hebYear are store-only. A member (or
 * admin) may edit; anyone else is a no-op.
 */
export async function updateAnniversary(
  input: UpdatePersonInput,
  viewerEmail: string,
): Promise<{ updated: boolean }> {
  if (!isStoreConfigured()) throw new DatabaseNotConfiguredError();

  const person = await getPerson(input.id);
  if (!person) return { updated: false };

  const email = viewerEmail.toLowerCase();
  if (!person.members.includes(email) && !isAnniversariesAdmin(viewerEmail)) {
    return { updated: false };
  }

  const name = input.name?.trim() || person.name;
  const type = input.type ?? person.type;
  const hebDay = input.hebDay ?? person.hebDate.day;
  const hebMonth = input.hebMonth ?? person.hebDate.month;
  const nameOrTypeChanged = name !== person.name || type !== person.type;
  const dateChanged =
    hebDay !== person.hebDate.day || hebMonth !== person.hebDate.month;
  const needsResync = nameOrTypeChanged || dateChanged;

  // When the date changes, regenerate occurrences (same count as today) at
  // the new day/month — reusing the existing record preserves manual
  // overrides and googleEventIds, so the sync below PATCHes those events in
  // place instead of creating duplicates and leaving the old ones stale.
  const base = dateChanged
    ? desiredStored(person, hebDay, hebMonth, Math.max(1, person.events.length))
    : person.events;
  if (dateChanged && base.length === 0) throw new NoSuchHebrewDateError();

  const patch: Parameters<typeof updatePerson>[1] = {};
  if (name !== person.name) patch.name = name;
  if (type !== person.type) patch.type = type;
  if (dateChanged) {
    patch.hebDay = hebDay;
    patch.hebMonth = hebMonth as HebrewMonthKey;
  }
  if (needsResync) {
    patch.key = anniversaryKey(name, hebDay, hebMonth, type);
  }
  if (input.hebrewName !== undefined) {
    patch.hebrewName = input.hebrewName.trim() || null;
  }
  if (input.origin !== undefined) patch.origin = input.origin.trim() || null;
  if (input.hebYear !== undefined) {
    patch.hebYear =
      Number.isFinite(input.hebYear) && input.hebYear > 0
        ? Math.floor(input.hebYear)
        : null;
  }

  if (Object.keys(patch).length === 0) return { updated: false };

  await updatePerson(input.id, patch);

  if (needsResync) {
    const sync = await syncPersonEvents({
      personId: person.id,
      summary: input.summary,
      summaryFallback: name,
      description: "",
      colorId: colorIdFor(type),
      members: person.members,
      events: base.map(toDesired),
    });
    await updatePerson(input.id, {
      events: applySynced(base, sync.events),
    });
    if (sync.rateLimited) throw new CalendarRateLimitError();
  }

  return { updated: true };
}

// --- prod → pre-prod data sync (admin only) ---

export class ProdSyncNotConfiguredError extends Error {
  constructor() {
    super("prod-sync-not-configured");
    this.name = "ProdSyncNotConfiguredError";
  }
}

/**
 * Whether this deployment can pull data from production — i.e. `PROD_DATABASE_URL`
 * is set and its own store is configured. Only true on the pre-prod deployment.
 */
export function canSyncFromProd(): boolean {
  return prodDatabaseUrl() !== null && isStoreConfigured();
}

/** Short, deterministic, non-reversible stand-in for a piece of real data. */
function pseudonym(seed: string): string {
  return createHash("sha256").update(seed).digest("hex").slice(0, 12);
}

/**
 * Replace a prod person's real identity with a deterministic placeholder
 * before it ever reaches the pre-prod database: names and member emails are
 * hashed (same input always yields the same output, so re-running the sync
 * keeps pre-prod's data internally consistent — e.g. a member shared across
 * several anniversaries stays the same fake member everywhere). Hebrew dates
 * and `type` are left untouched — they drive the occurrence logic pre-prod
 * exists to test. `googleEventId`/`htmlLink` are cleared too: they point at
 * prod's calendar, not pre-prod's.
 */
function maskPersonForPreprod(record: PersonRecord): PersonRecord {
  const name = `Person ${pseudonym(record.id)}`;
  return {
    ...record,
    name,
    hebrewName: record.hebrewName
      ? `Person ${pseudonym(`${record.id}:he`)}`
      : undefined,
    createdBy: "",
    key: anniversaryKey(
      name,
      record.hebDate.day,
      record.hebDate.month,
      record.type,
    ),
    members: record.members.map(
      (email) => `member-${pseudonym(email)}@preprod.invalid`,
    ),
    events: record.events.map((e) => ({
      ...e,
      googleEventId: "",
      htmlLink: "",
    })),
  };
}

/**
 * Replace this environment's `persons` with a pseudonymised copy of
 * production's (see `maskPersonForPreprod`), then create each person's events
 * fresh on pre-prod's own calendar (`GOOGLE_CALENDAR_ID`) — prod's
 * `googleEventId`s never existed there. Member emails are masked, so no real
 * invite is ever sent for synced data (`notifyEmails: []`).
 */
export async function syncFromProd(): Promise<{
  written: number;
  deleted: number;
}> {
  const sourceUrl = prodDatabaseUrl();
  if (!sourceUrl) throw new ProdSyncNotConfiguredError();
  if (!isStoreConfigured()) throw new DatabaseNotConfiguredError();
  if (sourceUrl === currentDatabaseUrl()) {
    throw new Error("prod-sync: source and target are the same database");
  }

  try {
    const source = await listPersonsFrom(sourceUrl);
    const masked = source.map(maskPersonForPreprod);
    const result = await replaceAllPersons(masked);

    for (const record of masked) {
      try {
        const sync = await syncPersonEvents({
          personId: record.id,
          summaryFallback: record.name,
          description: "",
          colorId: colorIdFor(record.type),
          members: record.members,
          events: record.events.map(toDesired),
          notifyEmails: [],
        });
        await updatePerson(record.id, {
          events: applySynced(record.events, sync.events),
        });
      } catch (error) {
        console.error(
          `[anniversaries] prod-sync: calendar sync failed for person ${record.id}:`,
          error,
        );
      }
    }

    return result;
  } catch (error) {
    console.error("[anniversaries] prod → pre-prod sync failed:", error);
    throw error;
  }
}
