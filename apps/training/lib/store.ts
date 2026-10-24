/**
 * Question bank + exam persistence (Neon / Drizzle). Server-only. Every
 * function takes the signed-in Clerk user id and scopes every query to it, so
 * one user can never reach another's rows. Inputs are assumed already
 * validated (see `lib/validate.ts`).
 */

import "server-only";

import { and, desc, eq, inArray, sql } from "drizzle-orm";

import { db } from "@/db/client";
import { exams, questions } from "@/db/schema";

import type { Exam, Question, QuestionInput, ResultStatus } from "./exam-logic";

export type StoreErrorCode = "not-found" | "empty-exam";

/** An expected, user-facing failure. Mapped to an error code by the actions. */
export class StoreError extends Error {
  constructor(public readonly code: StoreErrorCode) {
    super(code);
    this.name = "StoreError";
  }
}

type QuestionRow = typeof questions.$inferSelect;
type ExamRow = typeof exams.$inferSelect;

function toQuestion(row: QuestionRow): Question {
  return {
    id: row.id,
    cas: row.cas,
    prompts: row.prompts,
    answer: row.answer,
    siman: row.siman,
    seif: row.seif,
    sources: row.sources,
    isSpecial: row.isSpecial,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toExam(row: ExamRow): Exam {
  return {
    id: row.id,
    sourceExamId: row.sourceExamId,
    questions: row.questions,
    results: row.results,
    currentIndex: row.currentIndex,
    status: row.status === "completed" ? "completed" : "active",
    startedAt: row.startedAt.toISOString(),
    completedAt: row.completedAt?.toISOString() ?? null,
    reviewedAt: row.reviewedAt?.toISOString() ?? null,
  };
}

const ownQuestion = (ownerId: string, id: string) =>
  and(eq(questions.ownerId, ownerId), eq(questions.id, id));
const ownExam = (ownerId: string, id: string) =>
  and(eq(exams.ownerId, ownerId), eq(exams.id, id));

// ---------------------------------------------------------------------------
// Questions

export async function listQuestions(ownerId: string): Promise<Question[]> {
  const rows = await db()
    .select()
    .from(questions)
    .where(eq(questions.ownerId, ownerId))
    .orderBy(desc(questions.createdAt));
  return rows.map(toQuestion);
}

export async function getQuestion(
  ownerId: string,
  id: string,
): Promise<Question | null> {
  const [row] = await db()
    .select()
    .from(questions)
    .where(ownQuestion(ownerId, id));
  return row ? toQuestion(row) : null;
}

export async function createQuestion(
  ownerId: string,
  input: QuestionInput,
): Promise<Question> {
  const [row] = await db()
    .insert(questions)
    .values({ ownerId, ...input })
    .returning();
  return toQuestion(row!);
}

export async function updateQuestion(
  ownerId: string,
  id: string,
  input: QuestionInput,
): Promise<Question> {
  const [row] = await db()
    .update(questions)
    .set({ ...input, updatedAt: new Date() })
    .where(ownQuestion(ownerId, id))
    .returning();
  if (!row) throw new StoreError("not-found");
  return toQuestion(row);
}

export async function deleteQuestion(
  ownerId: string,
  id: string,
): Promise<void> {
  await db().delete(questions).where(ownQuestion(ownerId, id));
}

// ---------------------------------------------------------------------------
// Exams

export async function listExams(ownerId: string): Promise<Exam[]> {
  const rows = await db()
    .select()
    .from(exams)
    .where(eq(exams.ownerId, ownerId))
    .orderBy(desc(exams.startedAt));
  return rows.map(toExam);
}

export async function getExam(
  ownerId: string,
  id: string,
): Promise<Exam | null> {
  const [row] = await db().select().from(exams).where(ownExam(ownerId, id));
  return row ? toExam(row) : null;
}

/**
 * Snapshots the given questions (in the given order, unknown / foreign ids
 * dropped) into a new active exam.
 */
export async function createExam(
  ownerId: string,
  ids: string[],
  sourceExamId: string | null = null,
): Promise<Exam> {
  const rows = ids.length
    ? await db()
        .select()
        .from(questions)
        .where(and(eq(questions.ownerId, ownerId), inArray(questions.id, ids)))
    : [];
  const byId = new Map(rows.map((r) => [r.id, toQuestion(r)]));
  const snapshot = ids.flatMap((id) => byId.get(id) ?? []);
  if (snapshot.length === 0) throw new StoreError("empty-exam");

  const [row] = await db()
    .insert(exams)
    .values({ ownerId, sourceExamId, questions: snapshot })
    .returning();
  return toExam(row!);
}

/** "Redo my mistakes": a new exam with this one's partial / incorrect questions. */
export async function retryExam(
  ownerId: string,
  examId: string,
): Promise<Exam> {
  const exam = await getExam(ownerId, examId);
  if (!exam) throw new StoreError("not-found");
  const failed = exam.questions.filter((q) => {
    const r = exam.results[q.id];
    return r === "partial" || r === "incorrect";
  });
  return createExam(
    ownerId,
    failed.map((q) => q.id),
    examId,
  );
}

export async function setExamIndex(
  ownerId: string,
  examId: string,
  index: number,
): Promise<void> {
  await db()
    .update(exams)
    .set({ currentIndex: index })
    .where(ownExam(ownerId, examId));
}

export async function completeExam(
  ownerId: string,
  examId: string,
): Promise<Exam> {
  const [row] = await db()
    .update(exams)
    .set({
      status: "completed",
      completedAt: sql`coalesce(${exams.completedAt}, now())`,
    })
    .where(ownExam(ownerId, examId))
    .returning();
  if (!row) throw new StoreError("not-found");
  return toExam(row);
}

/**
 * Records (or changes) the manual result of one question. The jsonb merge is
 * atomic, so two devices correcting at once never overwrite each other.
 * `reviewed_at` is stamped the first time every question has a result.
 */
export async function rateQuestion(
  ownerId: string,
  examId: string,
  questionId: string,
  status: ResultStatus | null,
): Promise<Exam> {
  const results =
    status === null
      ? sql`${exams.results} - ${questionId}::text`
      : sql`${exams.results} || jsonb_build_object(${questionId}::text, ${status}::text)`;
  const [row] = await db()
    .update(exams)
    .set({ results })
    .where(ownExam(ownerId, examId))
    .returning();
  if (!row) throw new StoreError("not-found");

  const exam = toExam(row);
  if (!exam.reviewedAt && exam.questions.every((q) => exam.results[q.id])) {
    const reviewedAt = new Date();
    await db()
      .update(exams)
      .set({ reviewedAt })
      .where(ownExam(ownerId, examId));
    exam.reviewedAt = reviewedAt.toISOString();
  }
  return exam;
}

export async function deleteExam(
  ownerId: string,
  examId: string,
): Promise<void> {
  await db().delete(exams).where(ownExam(ownerId, examId));
}
