/**
 * Drizzle schema for the Panini album store (Neon project `panini`).
 *
 * One album per Clerk user (`albums.owner_id`). Every other table hangs off an
 * album and cascades on delete, so "reset" is a single `DELETE FROM albums`.
 */

import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const albums = pgTable("albums", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** Clerk user id. One album per user. */
  ownerId: text("owner_id").notNull().unique(),
  name: text("name").notNull(),
  /** Page assigned to newly generated numbered cards. */
  cardsPerPage: integer("cards_per_page").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
});

/** The people whose cards are counted (the kids), plus one `is_reserve` row. */
export const collectors = pgTable(
  "collectors",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    albumId: uuid("album_id")
      .notNull()
      .references(() => albums.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    /** A key of `COLLECTOR_COLORS` (lib/album-logic.ts). */
    color: text("color").notNull(),
    position: integer("position").notNull(),
    isReserve: boolean("is_reserve").notNull().default(false),
  },
  (t) => [index("collectors_album_idx").on(t.albumId)],
);

export const cards = pgTable(
  "cards",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    albumId: uuid("album_id")
      .notNull()
      .references(() => albums.id, { onDelete: "cascade" }),
    /** Free text: "12", "12A", "SP1", "או/19"… Unique per album. */
    code: text("code").notNull(),
    page: integer("page").notNull(),
    label: text("label").notNull().default(""),
  },
  (t) => [unique("cards_album_code_uq").on(t.albumId, t.code)],
);

/** How many copies of a card a collector has. Missing row = 0. */
export const cardCounts = pgTable(
  "card_counts",
  {
    cardId: uuid("card_id")
      .notNull()
      .references(() => cards.id, { onDelete: "cascade" }),
    collectorId: uuid("collector_id")
      .notNull()
      .references(() => collectors.id, { onDelete: "cascade" }),
    count: integer("count").notNull().default(0),
  },
  (t) => [
    primaryKey({ columns: [t.cardId, t.collectorId] }),
    check("card_counts_count_nonneg", sql`${t.count} >= 0`),
  ],
);

/**
 * A prize for completing a page. `deadline`: complete it before `deadline`.
 * `first_n`: only the first `winners` people to complete it win.
 */
export const pageRewards = pgTable(
  "page_rewards",
  {
    albumId: uuid("album_id")
      .notNull()
      .references(() => albums.id, { onDelete: "cascade" }),
    page: integer("page").notNull(),
    prize: text("prize").notNull(),
    /** `"deadline" | "first_n"`. */
    kind: text("kind").notNull(),
    deadline: date("deadline", { mode: "string" }),
    winners: integer("winners"),
  },
  (t) => [primaryKey({ columns: [t.albumId, t.page] })],
);
