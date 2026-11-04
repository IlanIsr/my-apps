/**
 * Drizzle schema for the translation workbench (Neon project `translation`).
 *
 * Every row belongs to one Clerk user (`owner_id`); nothing is shared. Page
 * scans are NOT stored here — they stay in the browser that created the
 * document (IndexedDB) and only travel to Claude for the transcription.
 */

import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import type {
  Resolution,
  Settings,
  Transcription,
  Translation,
} from "@/lib/model";

const ts = (name: string) =>
  timestamp(name, { withTimezone: true, mode: "date" });

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Clerk user id. */
    ownerId: text("owner_id").notNull(),
    title: text("title").notNull(),
    /** `"fr" | "en"`. */
    target: text("target").notNull(),
    /** A `Doctype` key. */
    doctype: text("doctype").notNull().default("auto"),
    /** `"standard" | "max"` — Claude's effort level. */
    quality: text("quality").notNull().default("standard"),
    highRes: boolean("high_res").notNull().default(true),
    createdAt: ts("created_at").notNull().defaultNow(),
    updatedAt: ts("updated_at").notNull().defaultNow(),
  },
  (t) => [index("documents_owner_idx").on(t.ownerId)],
);

export const pages = pgTable(
  "pages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    ownerId: text("owner_id").notNull(),
    position: integer("position").notNull(),
    /** A `PageOrigin`. */
    origin: text("origin").notNull(),
    source: text("source").notNull().default(""),
    /** A PDF's text layer, sent to Claude as a reference for exact characters. */
    pdfText: text("pdf_text"),
    textNote: text("text_note"),
    width: integer("width").notNull().default(0),
    height: integer("height").notNull().default(0),
    hasImage: boolean("has_image").notNull().default(false),
    transcription: jsonb("transcription").$type<Transcription>(),
    translation: jsonb("translation").$type<Translation>(),
    resolved: jsonb("resolved")
      .$type<Record<string, Resolution>>()
      .notNull()
      .default({}),
    reviewed: boolean("reviewed").notNull().default(false),
    error: text("error"),
    createdAt: ts("created_at").notNull().defaultNow(),
    updatedAt: ts("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("pages_document_idx").on(t.documentId, t.position),
    index("pages_owner_idx").on(t.ownerId),
  ],
);

export const glossaryEntries = pgTable(
  "glossary_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id").notNull(),
    /** Target language of the rendering, `"fr" | "en"`. */
    lang: text("lang").notNull(),
    /** The Hebrew term. */
    source: text("source").notNull(),
    rendering: text("rendering").notNull(),
    createdAt: ts("created_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("glossary_owner_lang_source_idx").on(
      t.ownerId,
      t.lang,
      t.source,
    ),
  ],
);

export const userSettings = pgTable("user_settings", {
  ownerId: text("owner_id").primaryKey(),
  settings: jsonb("settings").$type<Settings>().notNull(),
  updatedAt: ts("updated_at").notNull().defaultNow(),
});
