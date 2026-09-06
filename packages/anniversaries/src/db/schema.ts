/**
 * Drizzle schema for the anniversaries store (Neon / Postgres).
 *
 * `persons` is the source of truth; Google Calendar is a sync target. The
 * `persons.id` column is a plain `text` PK so Firestore document ids migrate in
 * unchanged and every `googleEventId` reference stays stable.
 */

import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const persons = pgTable(
  "persons",
  {
    /** Preserved Firestore document id (or `crypto.randomUUID()` for new rows). */
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    /** `"birthday" | "yahrzeit"`. */
    type: text("type").notNull(),
    hebrewName: text("hebrew_name"),
    origin: text("origin"),
    /** Hebrew year of birth / passing. Optional. */
    hebYear: integer("heb_year"),
    hebDay: integer("heb_day").notNull(),
    hebMonth: text("heb_month").notNull(),
    /** normalized-name + Hebrew day/month + type — used to dedupe on add. */
    key: text("key").notNull(),
    createdBy: text("created_by").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("persons_key_idx").on(t.key)],
);

export const personMembers = pgTable(
  "person_members",
  {
    personId: text("person_id")
      .notNull()
      .references(() => persons.id, { onDelete: "cascade" }),
    /** Lowercased email. */
    email: text("email").notNull(),
  },
  (t) => [primaryKey({ columns: [t.personId, t.email] })],
);

export const personEvents = pgTable(
  "person_events",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    personId: text("person_id")
      .notNull()
      .references(() => persons.id, { onDelete: "cascade" }),
    /** Hebrew year of the occurrence — the stable per-occurrence key. */
    year: integer("year").notNull(),
    /** Gregorian eve date, ISO `YYYY-MM-DD`. */
    date: text("date").notNull(),
    /** Start time `HH:MM`, or `""` meaning "use tzeit hakochavim". */
    time: text("time").notNull().default(""),
    /** Google Calendar event id (`""` until first sync) — preserved verbatim. */
    googleEventId: text("google_event_id").notNull().default(""),
    htmlLink: text("html_link").notNull().default(""),
    /** The user hand-edited this event's date/time — don't recompute it. */
    manual: boolean("manual").notNull().default(false),
  },
  (t) => [index("person_events_person_id_idx").on(t.personId)],
);

/**
 * Everyone who has touched the app or been added to an anniversary, keyed by
 * lowercased email. `hasSentEmail` = a Google Calendar invite has been sent to
 * this address at least once (so we don't re-notify them on every add).
 */
export const users = pgTable("users", {
  email: text("email").primaryKey(),
  /** Clerk user id — set once this address signs in; null for invite-only addresses. */
  clerkId: text("clerk_id"),
  hasSentEmail: boolean("has_sent_email").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
});

export type PersonRow = typeof persons.$inferSelect;
export type PersonInsert = typeof persons.$inferInsert;
export type PersonEventRow = typeof personEvents.$inferSelect;
export type UserRow = typeof users.$inferSelect;
