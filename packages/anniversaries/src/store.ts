/**
 * Persistence for anniversaries — Neon / Postgres via Drizzle. Server-only.
 *
 * `persons` is the source of truth; Google Calendar is a sync target (see
 * `calendar.ts`). This module owns *only* storage: no calendar, no auth, no
 * i18n. Multi-table writes go through `db.batch(...)`, which Neon runs as one
 * transaction, so a person and its members / events never land half-written.
 */

import { eq, inArray } from "drizzle-orm";

import type { HebrewMonthKey } from "@repo/hebcal";

import { db, dbFor, DatabaseNotConfiguredError, type Db } from "./db/client";
import {
  personEvents,
  personMembers,
  persons,
  users,
  type PersonEventRow,
  type PersonRow,
} from "./db/schema";
import { anniversaryKey, type AnniversaryType } from "./person";

export { DatabaseNotConfiguredError } from "./db/client";
/**
 * Back-compat alias. Historically the store was Firestore and threw
 * `StoreNotConfiguredError`; callers still catch that name.
 */
export { DatabaseNotConfiguredError as StoreNotConfiguredError } from "./db/client";

/** A stored event — carries bookkeeping the app-facing `AnniversaryEvent` hides. */
export type StoredEvent = {
  /** Hebrew year of the occurrence — the stable per-occurrence key. */
  year: number;
  /** Gregorian eve date, ISO `YYYY-MM-DD`. A manual edit overrides the computed one. */
  date: string;
  /** Start time `HH:MM`, or `""` meaning "use tzeit hakochavim". */
  time: string;
  /** Google Calendar event id (`""` until first sync). */
  googleEventId: string;
  /** Google Calendar event link (`""` until first sync). */
  htmlLink: string;
  /** The user hand-edited this event's date/time — don't recompute it. */
  manual?: boolean;
};

export type PersonRecord = {
  id: string;
  name: string;
  type: AnniversaryType;
  hebrewName?: string;
  origin?: string;
  hebYear?: number;
  hebDate: { day: number; month: HebrewMonthKey };
  key: string;
  members: string[];
  events: StoredEvent[];
  createdBy: string;
};

export type NewPerson = {
  name: string;
  type: AnniversaryType;
  hebrewName?: string;
  origin?: string;
  hebYear?: number;
  hebDate: { day: number; month: HebrewMonthKey };
  members: string[];
  createdBy: string;
};

export type PersonPatch = Partial<{
  hebrewName: string;
  origin: string;
  members: string[];
  events: StoredEvent[];
}>;

// --- config ---

/** Names of the store env vars that are missing, if any. */
export function storeConfigIssues(): string[] {
  return process.env.DATABASE_URL ? [] : ["DATABASE_URL"];
}

export function isStoreConfigured(): boolean {
  return storeConfigIssues().length === 0;
}

/** This deployment's own Postgres connection string, if set. */
export function currentDatabaseUrl(): string | undefined {
  return process.env.DATABASE_URL;
}

/**
 * A *source* Postgres connection string (production), from `PROD_DATABASE_URL`.
 * `null` unless set — which is only the case on the pre-prod deployment, so the
 * prod-sync feature is naturally pre-prod-only.
 */
export function prodDatabaseUrl(): string | null {
  return process.env.PROD_DATABASE_URL ?? null;
}

// --- row <-> record mapping ---

type BatchStmt = Parameters<Db["batch"]>[0][number];

async function runBatch(stmts: BatchStmt[]): Promise<void> {
  if (stmts.length === 0) return;
  await db().batch(stmts as [BatchStmt, ...BatchStmt[]]);
}

function lowerUnique(emails: string[]): string[] {
  return [
    ...new Set(emails.map((e) => e.trim().toLowerCase()).filter(Boolean)),
  ];
}

function toStoredEvent(row: PersonEventRow): StoredEvent {
  return {
    year: row.year,
    date: row.date,
    time: row.time,
    googleEventId: row.googleEventId,
    htmlLink: row.htmlLink,
    manual: row.manual ? true : undefined,
  };
}

function toRecord(
  p: PersonRow,
  memberEmails: string[],
  eventRows: PersonEventRow[],
): PersonRecord {
  // Dedupe events by Hebrew year (last row wins) — matches the Map semantics the
  // orchestration layer already relies on.
  const byYear = new Map<number, StoredEvent>();
  for (const row of eventRows) byYear.set(row.year, toStoredEvent(row));

  return {
    id: p.id,
    name: p.name,
    type: p.type === "yahrzeit" ? "yahrzeit" : "birthday",
    hebrewName: p.hebrewName ?? undefined,
    origin: p.origin ?? undefined,
    hebYear: p.hebYear ?? undefined,
    hebDate: { day: p.hebDay, month: p.hebMonth as HebrewMonthKey },
    key: p.key,
    members: [...new Set(memberEmails.map((e) => e.toLowerCase()))].sort(),
    events: [...byYear.values()].sort((a, b) => a.year - b.year),
    createdBy: p.createdBy,
  };
}

function personValues(input: {
  id: string;
  name: string;
  type: AnniversaryType;
  hebrewName?: string;
  origin?: string;
  hebYear?: number;
  hebDate: { day: number; month: string };
  key: string;
  createdBy: string;
}) {
  return {
    id: input.id,
    name: input.name,
    type: input.type,
    hebrewName: input.hebrewName ?? null,
    origin: input.origin ?? null,
    hebYear: input.hebYear ?? null,
    hebDay: input.hebDate.day,
    hebMonth: input.hebDate.month,
    key: input.key,
    createdBy: input.createdBy,
  };
}

function eventValues(personId: string, e: StoredEvent) {
  return {
    personId,
    year: e.year,
    date: e.date,
    time: e.time,
    googleEventId: e.googleEventId,
    htmlLink: e.htmlLink,
    manual: e.manual ?? false,
  };
}

// --- reads ---

async function listPersonsWith(d: Db): Promise<PersonRecord[]> {
  const [personRows, memberRows, eventRows] = await Promise.all([
    d.select().from(persons),
    d.select().from(personMembers),
    d.select().from(personEvents).orderBy(personEvents.id),
  ]);

  const membersByPerson = new Map<string, string[]>();
  for (const m of memberRows) {
    const list = membersByPerson.get(m.personId) ?? [];
    list.push(m.email);
    membersByPerson.set(m.personId, list);
  }
  const eventsByPerson = new Map<string, PersonEventRow[]>();
  for (const e of eventRows) {
    const list = eventsByPerson.get(e.personId) ?? [];
    list.push(e);
    eventsByPerson.set(e.personId, list);
  }

  return personRows.map((p) =>
    toRecord(
      p,
      membersByPerson.get(p.id) ?? [],
      eventsByPerson.get(p.id) ?? [],
    ),
  );
}

async function hydrate(d: Db, p: PersonRow): Promise<PersonRecord> {
  const [memberRows, eventRows] = await Promise.all([
    d.select().from(personMembers).where(eq(personMembers.personId, p.id)),
    d
      .select()
      .from(personEvents)
      .where(eq(personEvents.personId, p.id))
      .orderBy(personEvents.id),
  ]);
  return toRecord(
    p,
    memberRows.map((m) => m.email),
    eventRows,
  );
}

export async function listPersons(): Promise<PersonRecord[]> {
  return listPersonsWith(db());
}

/** Every person from another deployment's database (prod → pre-prod sync). */
export async function listPersonsFrom(
  connectionString: string,
): Promise<PersonRecord[]> {
  return listPersonsWith(dbFor(connectionString));
}

export async function getPerson(id: string): Promise<PersonRecord | null> {
  const [row] = await db().select().from(persons).where(eq(persons.id, id));
  return row ? hydrate(db(), row) : null;
}

export async function findByKey(key: string): Promise<PersonRecord | null> {
  const [row] = await db()
    .select()
    .from(persons)
    .where(eq(persons.key, key))
    .orderBy(persons.createdAt)
    .limit(1);
  return row ? hydrate(db(), row) : null;
}

// --- writes ---

export async function createPerson(input: NewPerson): Promise<PersonRecord> {
  if (!isStoreConfigured()) throw new DatabaseNotConfiguredError();

  const id = crypto.randomUUID();
  const key = anniversaryKey(
    input.name,
    input.hebDate.day,
    input.hebDate.month,
    input.type,
  );
  const members = lowerUnique(input.members);

  const stmts: BatchStmt[] = [
    db()
      .insert(persons)
      .values(personValues({ ...input, id, key })),
  ];
  if (members.length > 0) {
    stmts.push(
      db()
        .insert(personMembers)
        .values(members.map((email) => ({ personId: id, email }))),
    );
  }
  await runBatch(stmts);

  return {
    id,
    name: input.name,
    type: input.type,
    hebrewName: input.hebrewName,
    origin: input.origin,
    hebYear: input.hebYear,
    hebDate: input.hebDate,
    key,
    members,
    events: [],
    createdBy: input.createdBy,
  };
}

export async function updatePerson(
  id: string,
  patch: PersonPatch,
): Promise<void> {
  const set: Partial<typeof persons.$inferInsert> = { updatedAt: new Date() };
  if (patch.hebrewName !== undefined) set.hebrewName = patch.hebrewName || null;
  if (patch.origin !== undefined) set.origin = patch.origin || null;

  const stmts: BatchStmt[] = [
    db().update(persons).set(set).where(eq(persons.id, id)),
  ];

  if (patch.members !== undefined) {
    const members = lowerUnique(patch.members);
    stmts.push(
      db().delete(personMembers).where(eq(personMembers.personId, id)),
    );
    if (members.length > 0) {
      stmts.push(
        db()
          .insert(personMembers)
          .values(members.map((email) => ({ personId: id, email }))),
      );
    }
  }

  if (patch.events !== undefined) {
    stmts.push(db().delete(personEvents).where(eq(personEvents.personId, id)));
    if (patch.events.length > 0) {
      stmts.push(
        db()
          .insert(personEvents)
          .values(patch.events.map((e) => eventValues(id, e))),
      );
    }
  }

  await runBatch(stmts);
}

export async function deletePerson(id: string): Promise<void> {
  await db().delete(persons).where(eq(persons.id, id));
}

/**
 * Insert-or-replace a whole person record by id — members and events included.
 * Used by the one-time Firestore migration and the prod → pre-prod sync. Keeps
 * the id (and every `googleEventId`) exactly as given.
 */
export async function upsertPerson(record: PersonRecord): Promise<void> {
  const values = personValues(record);
  const stmts: BatchStmt[] = [
    db()
      .insert(persons)
      .values(values)
      .onConflictDoUpdate({
        target: persons.id,
        set: {
          name: values.name,
          type: values.type,
          hebrewName: values.hebrewName,
          origin: values.origin,
          hebYear: values.hebYear,
          hebDay: values.hebDay,
          hebMonth: values.hebMonth,
          key: values.key,
          createdBy: values.createdBy,
          updatedAt: new Date(),
        },
      }),
    db().delete(personMembers).where(eq(personMembers.personId, record.id)),
    db().delete(personEvents).where(eq(personEvents.personId, record.id)),
  ];

  const members = lowerUnique(record.members);
  if (members.length > 0) {
    stmts.push(
      db()
        .insert(personMembers)
        .values(members.map((email) => ({ personId: record.id, email }))),
    );
  }
  if (record.events.length > 0) {
    stmts.push(
      db()
        .insert(personEvents)
        .values(record.events.map((e) => eventValues(record.id, e))),
    );
  }

  await runBatch(stmts);
}

/**
 * Make this deployment's `persons` an exact mirror of `records`: upsert every
 * one, delete the rest. Used only by the prod-sync feature.
 */
export async function replaceAllPersons(
  records: PersonRecord[],
): Promise<{ written: number; deleted: number }> {
  const existing = await db().select({ id: persons.id }).from(persons);
  const keep = new Set(records.map((r) => r.id));

  let deleted = 0;
  for (const row of existing) {
    if (!keep.has(row.id)) {
      await deletePerson(row.id);
      deleted++;
    }
  }
  for (const record of records) await upsertPerson(record);

  return { written: records.length, deleted };
}

// --- users ---

/**
 * Record an email as a known user. `clerkId` is stored when known (the address
 * has signed in); passing `undefined` leaves any existing id untouched.
 */
export async function upsertUser(input: {
  email: string;
  clerkId?: string;
}): Promise<void> {
  const email = input.email.trim().toLowerCase();
  if (!email) return;
  const set: { updatedAt: Date; clerkId?: string } = { updatedAt: new Date() };
  if (input.clerkId) set.clerkId = input.clerkId;
  await db()
    .insert(users)
    .values({ email, clerkId: input.clerkId ?? null })
    .onConflictDoUpdate({ target: users.email, set });
}

/** `email → hasSentEmail` for the given addresses. Missing addresses map to `false`. */
export async function getEmailSentState(
  emails: string[],
): Promise<Map<string, boolean>> {
  const wanted = lowerUnique(emails);
  const state = new Map<string, boolean>(wanted.map((e) => [e, false]));
  if (wanted.length === 0) return state;
  const rows = await db()
    .select({ email: users.email, hasSentEmail: users.hasSentEmail })
    .from(users)
    .where(inArray(users.email, wanted));
  for (const r of rows) state.set(r.email, r.hasSentEmail);
  return state;
}

/** Mark that a Google Calendar invite has now been sent to these addresses. */
export async function markEmailSent(emails: string[]): Promise<void> {
  const wanted = lowerUnique(emails);
  if (wanted.length === 0) return;
  const stmts: BatchStmt[] = wanted.map((email) =>
    db()
      .insert(users)
      .values({ email, hasSentEmail: true })
      .onConflictDoUpdate({
        target: users.email,
        set: { hasSentEmail: true, updatedAt: new Date() },
      }),
  );
  await runBatch(stmts);
}
