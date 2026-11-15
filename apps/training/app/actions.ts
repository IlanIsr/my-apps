"use server";

/**
 * Server actions. Each one resolves the signed-in Clerk user, validates its
 * input (`lib/validate.ts`), calls the store — which scopes every query to
 * that user — and maps failures to a stable error code.
 */

import { revalidatePath } from "next/cache";

import { DatabaseNotConfiguredError } from "@/db/client";
import { currentOwnerId } from "@/lib/owner";
import { LIMITS, type Exam, type Question } from "@/lib/exam-logic";
import * as store from "@/lib/store";
import type { Note, StudyPlan } from "@/lib/study-logic";
import * as study from "@/lib/study-store";
import * as v from "@/lib/validate";

export type ActionErrorCode =
  | store.StoreErrorCode
  | "not-signed-in"
  | "invalid"
  | "db-not-configured"
  | "unknown";

export type ActionResult<T> =
  { ok: true; data: T } | { ok: false; error: ActionErrorCode };

class NotSignedInError extends Error {}

async function run<T>(
  fn: (ownerId: string) => Promise<T>,
): Promise<ActionResult<T>> {
  try {
    const ownerId = await currentOwnerId();
    if (!ownerId) throw new NotSignedInError();
    const data = await fn(ownerId);
    // Every page reads fresh data server-side.
    revalidatePath("/", "layout");
    return { ok: true, data };
  } catch (error) {
    if (error instanceof NotSignedInError) {
      return { ok: false, error: "not-signed-in" };
    }
    if (error instanceof store.StoreError)
      return { ok: false, error: error.code };
    if (error instanceof v.InvalidInputError) {
      return { ok: false, error: "invalid" };
    }
    if (error instanceof DatabaseNotConfiguredError) {
      return { ok: false, error: "db-not-configured" };
    }
    console.error("[training] action failed:", error);
    return { ok: false, error: "unknown" };
  }
}

export async function createQuestionAction(
  input: unknown,
): Promise<ActionResult<Question>> {
  return run((ownerId) =>
    store.createQuestion(ownerId, v.questionInput(input)),
  );
}

export async function updateQuestionAction(
  id: string,
  input: unknown,
): Promise<ActionResult<Question>> {
  return run((ownerId) =>
    store.updateQuestion(ownerId, v.id(id), v.questionInput(input)),
  );
}

export async function deleteQuestionAction(
  id: string,
): Promise<ActionResult<null>> {
  return run(async (ownerId) => {
    await store.deleteQuestion(ownerId, v.id(id));
    return null;
  });
}

/** `ids` = the picked questions, in exam order. */
export async function createExamAction(
  ids: string[],
): Promise<ActionResult<Exam>> {
  return run((ownerId) =>
    store.createExam(ownerId, v.ids(ids, LIMITS.examQuestions)),
  );
}

export async function retryExamAction(
  examId: string,
): Promise<ActionResult<Exam>> {
  return run((ownerId) => store.retryExam(ownerId, v.id(examId)));
}

export async function setExamIndexAction(
  examId: string,
  index: number,
): Promise<ActionResult<null>> {
  return run(async (ownerId) => {
    await store.setExamIndex(
      ownerId,
      v.id(examId),
      v.int(index, "index", 0, LIMITS.examQuestions),
    );
    return null;
  });
}

export async function completeExamAction(
  examId: string,
): Promise<ActionResult<Exam>> {
  return run((ownerId) => store.completeExam(ownerId, v.id(examId)));
}

/** `status: null` clears the result. */
export async function rateQuestionAction(
  examId: string,
  questionId: string,
  status: unknown,
): Promise<ActionResult<Exam>> {
  return run((ownerId) =>
    store.rateQuestion(
      ownerId,
      v.id(examId),
      v.id(questionId),
      v.resultStatus(status),
    ),
  );
}

export async function deleteExamAction(
  examId: string,
): Promise<ActionResult<null>> {
  return run(async (ownerId) => {
    await store.deleteExam(ownerId, v.id(examId));
    return null;
  });
}

// ---------------------------------------------------------------------------
// Study plans + notes

export async function createPlanAction(
  input: unknown,
): Promise<ActionResult<StudyPlan>> {
  return run((ownerId) => study.createPlan(ownerId, v.planInput(input)));
}

export async function updatePlanRhythmAction(
  id: string,
  input: unknown,
): Promise<ActionResult<StudyPlan>> {
  return run((ownerId) =>
    study.updatePlanRhythm(ownerId, v.id(id), v.rhythmInput(input)),
  );
}

/** `day: null` un-marks the amudim. */
export async function setStudiedAction(
  id: string,
  amudim: unknown,
  day: unknown,
): Promise<ActionResult<StudyPlan>> {
  return run((ownerId) =>
    study.setStudied(
      ownerId,
      v.id(id),
      v.amudList(amudim),
      day === null ? null : v.isoDay(day),
    ),
  );
}

export async function deletePlanAction(
  id: string,
): Promise<ActionResult<null>> {
  return run(async (ownerId) => {
    await study.deletePlan(ownerId, v.id(id));
    return null;
  });
}

export async function createNoteAction(
  input: unknown,
): Promise<ActionResult<Note>> {
  return run((ownerId) => study.createNote(ownerId, v.noteInput(input)));
}

export async function updateNoteAction(
  id: string,
  input: unknown,
): Promise<ActionResult<Note>> {
  return run((ownerId) =>
    study.updateNote(ownerId, v.id(id), v.noteInput(input)),
  );
}

export async function deleteNoteAction(
  id: string,
): Promise<ActionResult<null>> {
  return run(async (ownerId) => {
    await study.deleteNote(ownerId, v.id(id));
    return null;
  });
}
