/**
 * Study plans + notes persistence (Neon / Drizzle). Server-only. Same rules as
 * `lib/store.ts`: every function takes the Clerk user id and scopes every
 * query to it; inputs are already validated (`lib/validate.ts`).
 */

import "server-only";

import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db/client";
import { lexiconEntries, notes, studyPlans } from "@/db/schema";

import { StoreError } from "./store";
import type {
  LexiconEntry,
  LexiconInput,
  Note,
  NoteInput,
  StudyPlan,
  StudyPlanInput,
  Subject,
} from "./study-logic";

type PlanRow = typeof studyPlans.$inferSelect;
type NoteRow = typeof notes.$inferSelect;

function toPlan(row: PlanRow): StudyPlan {
  return {
    id: row.id,
    subject: row.subject as Subject,
    book: row.book,
    startAmud: row.startAmud,
    endAmud: row.endAmud,
    pace: row.pace,
    weekdays: row.weekdays,
    startDate: row.startDate,
    endDate: row.endDate,
    studied: row.studied,
    createdAt: row.createdAt.toISOString(),
  };
}

function toNote(row: NoteRow): Note {
  return {
    id: row.id,
    subject: row.subject as Subject,
    book: row.book,
    startAmud: row.startAmud,
    endAmud: row.endAmud,
    planId: row.planId,
    title: row.title,
    content: row.content,
    text: row.text,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

const ownPlan = (ownerId: string, id: string) =>
  and(eq(studyPlans.ownerId, ownerId), eq(studyPlans.id, id));
const ownNote = (ownerId: string, id: string) =>
  and(eq(notes.ownerId, ownerId), eq(notes.id, id));

// ---------------------------------------------------------------------------
// Plans

export async function listPlans(ownerId: string): Promise<StudyPlan[]> {
  const rows = await db()
    .select()
    .from(studyPlans)
    .where(eq(studyPlans.ownerId, ownerId))
    .orderBy(desc(studyPlans.createdAt));
  return rows.map(toPlan);
}

export async function getPlan(
  ownerId: string,
  id: string,
): Promise<StudyPlan | null> {
  const [row] = await db()
    .select()
    .from(studyPlans)
    .where(ownPlan(ownerId, id));
  return row ? toPlan(row) : null;
}

export async function createPlan(
  ownerId: string,
  input: StudyPlanInput,
): Promise<StudyPlan> {
  const [row] = await db()
    .insert(studyPlans)
    .values({ ownerId, ...input })
    .returning();
  return toPlan(row!);
}

/** Rhythm changes: pace, weekdays, end date. The range and progress stay. */
export async function updatePlanRhythm(
  ownerId: string,
  id: string,
  input: Pick<StudyPlan, "pace" | "weekdays" | "endDate">,
): Promise<StudyPlan> {
  const [row] = await db()
    .update(studyPlans)
    .set({ ...input, updatedAt: new Date() })
    .where(ownPlan(ownerId, id))
    .returning();
  if (!row) throw new StoreError("not-found");
  return toPlan(row);
}

/**
 * Marks amudim as studied on `day`, or un-marks them (`day: null`). One
 * atomic jsonb merge, so two devices never overwrite each other.
 */
export async function setStudied(
  ownerId: string,
  id: string,
  amudim: number[],
  day: string | null,
): Promise<StudyPlan> {
  const keys = amudim.map(String);
  const studied =
    day === null
      ? sql`${studyPlans.studied} - ARRAY[${sql.join(
          keys.map((k) => sql`${k}`),
          sql`, `,
        )}]::text[]`
      : sql`${studyPlans.studied} || ${JSON.stringify(
          Object.fromEntries(keys.map((k) => [k, day])),
        )}::jsonb`;
  const [row] = await db()
    .update(studyPlans)
    .set({ studied, updatedAt: new Date() })
    .where(ownPlan(ownerId, id))
    .returning();
  if (!row) throw new StoreError("not-found");
  return toPlan(row);
}

export async function deletePlan(ownerId: string, id: string): Promise<void> {
  await db().delete(studyPlans).where(ownPlan(ownerId, id));
}

// ---------------------------------------------------------------------------
// Notes

export async function listNotes(ownerId: string): Promise<Note[]> {
  const rows = await db()
    .select()
    .from(notes)
    .where(eq(notes.ownerId, ownerId))
    .orderBy(notes.book, notes.startAmud, desc(notes.updatedAt));
  return rows.map(toNote);
}

export async function getNote(
  ownerId: string,
  id: string,
): Promise<Note | null> {
  const [row] = await db().select().from(notes).where(ownNote(ownerId, id));
  return row ? toNote(row) : null;
}

export async function createNote(
  ownerId: string,
  input: NoteInput,
): Promise<Note> {
  const [row] = await db()
    .insert(notes)
    .values({ ownerId, ...input })
    .returning();
  return toNote(row!);
}

export async function updateNote(
  ownerId: string,
  id: string,
  input: NoteInput,
): Promise<Note> {
  const [row] = await db()
    .update(notes)
    .set({ ...input, updatedAt: new Date() })
    .where(ownNote(ownerId, id))
    .returning();
  if (!row) throw new StoreError("not-found");
  return toNote(row);
}

export async function deleteNote(ownerId: string, id: string): Promise<void> {
  await db().delete(notes).where(ownNote(ownerId, id));
}

// ---------------------------------------------------------------------------
// Lexicon

type LexiconRow = typeof lexiconEntries.$inferSelect;

function toEntry(row: LexiconRow): LexiconEntry {
  return {
    id: row.id,
    book: row.book,
    amud: row.amud,
    term: row.term,
    translation: row.translation,
    note: row.note,
    createdAt: row.createdAt.toISOString(),
  };
}

const ownEntry = (ownerId: string, id: string) =>
  and(eq(lexiconEntries.ownerId, ownerId), eq(lexiconEntries.id, id));

/** One masekhet's lexicon, by amud then in the order written. */
export async function listLexicon(
  ownerId: string,
  book: string,
): Promise<LexiconEntry[]> {
  const rows = await db()
    .select()
    .from(lexiconEntries)
    .where(
      and(eq(lexiconEntries.ownerId, ownerId), eq(lexiconEntries.book, book)),
    )
    .orderBy(lexiconEntries.amud, lexiconEntries.createdAt);
  return rows.map(toEntry);
}

/** How many entries each masekhet has. */
export async function lexiconCounts(
  ownerId: string,
): Promise<Record<string, number>> {
  const rows = await db()
    .select({ book: lexiconEntries.book, count: sql<number>`count(*)::int` })
    .from(lexiconEntries)
    .where(eq(lexiconEntries.ownerId, ownerId))
    .groupBy(lexiconEntries.book);
  return Object.fromEntries(rows.map((r) => [r.book, r.count]));
}

export async function createLexiconEntry(
  ownerId: string,
  input: LexiconInput,
): Promise<LexiconEntry> {
  const [row] = await db()
    .insert(lexiconEntries)
    .values({ ownerId, ...input })
    .returning();
  return toEntry(row!);
}

export async function updateLexiconEntry(
  ownerId: string,
  id: string,
  input: LexiconInput,
): Promise<LexiconEntry> {
  const [row] = await db()
    .update(lexiconEntries)
    .set({ ...input, updatedAt: new Date() })
    .where(ownEntry(ownerId, id))
    .returning();
  if (!row) throw new StoreError("not-found");
  return toEntry(row);
}

export async function deleteLexiconEntry(
  ownerId: string,
  id: string,
): Promise<void> {
  await db().delete(lexiconEntries).where(ownEntry(ownerId, id));
}
