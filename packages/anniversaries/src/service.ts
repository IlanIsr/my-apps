/**
 * Orchestration: Firestore is the source of truth, Google Calendar is a sync
 * target. Every mutation writes the store, then reconciles the calendar.
 *
 * This is the API app-1 consumes (via `app/anniversaries/actions.ts`). Callers
 * pass the signed-in user's email + a pre-translated event `summary`; this
 * package does no auth and no i18n.
 */

import {
  calculateNextOccurrences,
  getTsetHakohavimWithFallback,
  type HebrewMonthKey,
} from "@repo/hebcal";

import {
  isCalendarReachable,
  patchEvent,
  syncPersonEvents,
} from "./calendar";
import {
  formatHebDateLabel,
  anniversaryKey,
  type Anniversary,
  type AnniversaryEvent,
} from "./person";
import {
  createPerson,
  findByKey,
  getPerson,
  isStoreConfigured,
  listPersons,
  updatePerson,
  StoreNotConfiguredError,
  type PersonRecord,
  type StoredEvent,
} from "./store";

export { CalendarNotConfiguredError } from "./calendar";
export { StoreNotConfiguredError } from "./store";

export class NoSuchHebrewDateError extends Error {
  constructor() {
    super("no-such-hebrew-date");
    this.name = "NoSuchHebrewDateError";
  }
}

const MAX_YEARS = 50;

function unique(emails: string[]): string[] {
  return [...new Set(emails.map((e) => e.trim().toLowerCase()).filter(Boolean))];
}

function todayISO(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function toAnniversary(
  record: PersonRecord,
  viewerEmail: string,
): Anniversary {
  const email = viewerEmail.toLowerCase();
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
    hebrewName: record.hebrewName,
    origin: record.origin,
    hebDate: record.hebDate,
    hebDateLabel: formatHebDateLabel(record.hebDate),
    members: [...record.members].sort(),
    joined: record.members.includes(email),
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
  synced: { year: number; date: string; time: string; googleEventId: string; htmlLink: string }[],
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

/** Whether both the store and the shared calendar are configured and reachable. */
export async function isCalendarConfigured(): Promise<boolean> {
  if (!isStoreConfigured()) return false;
  return isCalendarReachable();
}

export async function listAnniversaries(
  viewerEmail: string,
): Promise<Anniversary[]> {
  const records = await listPersons();
  return records
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
  hebDay: number;
  hebMonth: string;
  years: number;
  /** Extra people to add to the family list alongside the current user. */
  sharedEmails: string[];
  hebrewName?: string;
  origin?: string;
  /** Pre-translated event title. */
  summary: string;
  /** Clerk id of the signed-in user. */
  createdBy: string;
};

/**
 * Create a person + their events, or — if a matching person exists — add the
 * current user (and any `sharedEmails`) and top up missing future years.
 */
export async function addAnniversary(
  input: AddAnniversaryInput,
  viewerEmail: string,
): Promise<{ created: number; joined: boolean }> {
  if (!isStoreConfigured()) throw new StoreNotConfiguredError();

  const email = viewerEmail.toLowerCase();
  const shared = unique(input.sharedEmails);
  const years = Math.min(
    MAX_YEARS,
    Math.max(1, Number.isFinite(input.years) ? Math.floor(input.years) : 1),
  );
  const key = anniversaryKey(input.name, input.hebDay, input.hebMonth);
  const existing = await findByKey(key);

  if (!existing) {
    const base = desiredStored(null, input.hebDay, input.hebMonth, years);
    if (base.length === 0) throw new NoSuchHebrewDateError();

    const members = unique([email, ...shared]);
    const record = await createPerson({
      name: input.name.trim(),
      hebrewName: input.hebrewName?.trim() || undefined,
      origin: input.origin?.trim() || undefined,
      hebDate: { day: input.hebDay, month: input.hebMonth as HebrewMonthKey },
      members,
      createdBy: input.createdBy,
    });

    const sync = await syncPersonEvents({
      personId: record.id,
      summary: input.summary,
      summaryFallback: record.name,
      description: "",
      members,
      events: base.map(toDesired),
    });
    const finalMembers = members.filter((m) => !sync.declined.includes(m));
    await updatePerson(record.id, {
      members: finalMembers,
      events: applySynced(base, sync.events),
    });
    return {
      created: sync.events.length,
      joined: finalMembers.includes(email),
    };
  }

  const members = unique([...existing.members, email, ...shared]);
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
    members,
    events: base.map(toDesired),
  });
  // A declined guest has effectively left. The person + events still stay on
  // the shared calendar — only the shared account itself removes an event.
  const finalMembers = members.filter((m) => !sync.declined.includes(m));

  await updatePerson(existing.id, {
    members: finalMembers,
    events: applySynced(base, sync.events),
  });
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
    members,
    events: person.events.map(toDesired),
  });
  const finalMembers = members.filter((m) => !sync.declined.includes(m));

  await updatePerson(id, {
    members: finalMembers,
    events: applySynced(person.events, sync.events),
  });
  return { removed: 1, deleted: 0 };
}

export type UpdateEventInput = {
  /** Person (Firestore) id. */
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
