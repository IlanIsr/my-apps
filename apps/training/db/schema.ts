/**
 * Drizzle schema for the question bank + exams (Neon project `training`).
 *
 * Every row belongs to one Clerk user (`owner_id`); nothing is shared. An exam
 * keeps a snapshot of its questions (`questions` jsonb) so editing or deleting
 * a question later never rewrites a past exam.
 */

import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import type { Question, ResultStatus, Sources } from "@/lib/exam-logic";

const ts = (name: string) =>
  timestamp(name, { withTimezone: true, mode: "date" });

export const questions = pgTable(
  "questions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Clerk user id. */
    ownerId: text("owner_id").notNull(),
    /** Optional case text the prompts refer to. */
    cas: text("cas"),
    /** One or more prompts (non-empty). */
    prompts: jsonb("prompts").$type<string[]>().notNull(),
    /** Optional answer for the whole question. */
    answer: text("answer"),
    siman: text("siman").notNull().default(""),
    seif: text("seif").notNull().default(""),
    sources: jsonb("sources").$type<Sources>().notNull(),
    isSpecial: boolean("is_special").notNull().default(false),
    createdAt: ts("created_at").notNull().defaultNow(),
    updatedAt: ts("updated_at").notNull().defaultNow(),
  },
  (t) => [index("questions_owner_idx").on(t.ownerId)],
);

export const exams = pgTable(
  "exams",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id").notNull(),
    /** The exam a "redo my mistakes" exam came from. */
    sourceExamId: uuid("source_exam_id"),
    /** Snapshot of the questions, in exam order. */
    questions: jsonb("questions").$type<Question[]>().notNull(),
    /** Manual correction, by question id. */
    results: jsonb("results")
      .$type<Partial<Record<string, ResultStatus>>>()
      .notNull()
      .default({}),
    currentIndex: integer("current_index").notNull().default(0),
    /** `"active" | "completed"`. */
    status: text("status").notNull().default("active"),
    startedAt: ts("started_at").notNull().defaultNow(),
    completedAt: ts("completed_at"),
    reviewedAt: ts("reviewed_at"),
  },
  (t) => [index("exams_owner_idx").on(t.ownerId)],
);
