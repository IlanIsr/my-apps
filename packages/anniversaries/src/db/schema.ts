/**
 * Drizzle schema for the anniversaries store (Neon / Postgres).
 *
 * `persons` is the source of truth; Google Calendar is a sync target. The
 * `persons.id` column is a plain `text` PK so imported ids are kept unchanged
 * and every `googleEventId` reference stays stable.
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
    /** Preserved legacy id for imported rows, else `crypto.randomUUID()`. */
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    /** `"birthday" | "yahrzeit"`. */
    type: text("type").notNull(),
    hebrewName: text("hebrew_name"),
    origin: text("origin"),
    /** Hebrew year of birth / passing. Optional. */
    hebYear: integer("heb_year"),
    /** `"sephardi" | "ashkenazi"` — which Adar a single-Adar yahrzeit falls
     * in during a leap year (II / I). */
    minhag: text("minhag").notNull().default("sephardi"),
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
 * A person's extra Google Calendar series, one per reference city its members
 * use other than Jerusalem (whose series id stays in `person_events`). Each
 * member is an attendee of their own city's series only. Rows are never
 * deleted: a series nobody uses any more just has no attendees.
 */
export const personSeries = pgTable(
  "person_series",
  {
    personId: text("person_id")
      .notNull()
      .references(() => persons.id, { onDelete: "cascade" }),
    /** `LocationId`, never `"jerusalem"`. */
    location: text("location").notNull(),
    googleEventId: text("google_event_id").notNull(),
    htmlLink: text("html_link").notNull().default(""),
  },
  (t) => [primaryKey({ columns: [t.personId, t.location] })],
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
  /**
   * Profile: `"sephardi" | "ashkenazi"`, null until chosen. Sets the wording
   * (Azkara / Yortzeit) and the default Adar minhag of new anniversaries.
   */
  minhag: text("minhag"),
  /**
   * Secret of the user's private iCalendar feed (`/feed/<token>.ics`, the
   * Apple / Outlook subscription). Null until they ask for the link.
   */
  feedToken: text("feed_token").unique(),
  /**
   * Profile: reference city (`@repo/hebcal`'s `LocationId`) — the timezone and
   * place of nightfall of their calendar events. Null = Jerusalem.
   */
  location: text("location"),
  /** The first-visit modal explaining the profile settings was shown. */
  onboardingShown: boolean("onboarding_shown").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
});

/**
 * A shareable, time-limited link: a member picks a subset of their
 * anniversaries, generates one of these, and shares the URL themselves
 * outside the app. Reusable by multiple recipients until it expires.
 */
export const shareLinks = pgTable("share_links", {
  /** The token itself — unguessable, same trust model as `persons.id`. */
  id: text("id").primaryKey(),
  /** Lowercased email of the member who generated the link. */
  createdBy: text("created_by").notNull(),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
});

export const shareLinkPersons = pgTable(
  "share_link_persons",
  {
    shareLinkId: text("share_link_id")
      .notNull()
      .references(() => shareLinks.id, { onDelete: "cascade" }),
    personId: text("person_id")
      .notNull()
      .references(() => persons.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.shareLinkId, t.personId] })],
);

export type PersonRow = typeof persons.$inferSelect;
export type PersonInsert = typeof persons.$inferInsert;
export type PersonEventRow = typeof personEvents.$inferSelect;
export type PersonSeriesRow = typeof personSeries.$inferSelect;
export type UserRow = typeof users.$inferSelect;
export type ShareLinkRow = typeof shareLinks.$inferSelect;
