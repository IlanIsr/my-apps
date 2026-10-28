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
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import type { RewardTier } from "@/lib/album-logic";

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
 * `first_n`: only the first `winners` people to complete it win. `tiers`: a
 * ranking — `tiers` lists `{ winners, prize }` in finishing order (`prize`
 * then holds the first tier's prize).
 */
export const pageRewards = pgTable(
  "page_rewards",
  {
    albumId: uuid("album_id")
      .notNull()
      .references(() => albums.id, { onDelete: "cascade" }),
    page: integer("page").notNull(),
    prize: text("prize").notNull(),
    /** `"deadline" | "first_n" | "tiers"`. */
    kind: text("kind").notNull(),
    deadline: date("deadline", { mode: "string" }),
    winners: integer("winners"),
    tiers: jsonb("tiers").$type<RewardTier[]>(),
  },
  (t) => [primaryKey({ columns: [t.albumId, t.page] })],
);

/**
 * An album shared with friends ("Amis" tab). `token` is the link's secret —
 * a new one kills the old link but keeps everyone who already joined. Friends
 * only ever see an aggregate (which cards the family has / is looking for),
 * never who owns what.
 */
export const albumShares = pgTable("album_shares", {
  albumId: uuid("album_id")
    .primaryKey()
    .references(() => albums.id, { onDelete: "cascade" }),
  token: uuid("token").notNull().unique().defaultRandom(),
  /** Name friends see ("Famille Cohen"). */
  displayName: text("display_name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
});

/** Who can see a shared album. Removing the share removes them all. */
export const shareViewers = pgTable(
  "share_viewers",
  {
    albumId: uuid("album_id")
      .notNull()
      .references(() => albumShares.albumId, { onDelete: "cascade" }),
    /** Clerk user id of the friend. */
    viewerId: text("viewer_id").notNull(),
    /** The friend's name when they joined, shown to the album's owner. */
    viewerName: text("viewer_name").notNull(),
    joinedAt: timestamp("joined_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.albumId, t.viewerId] }),
    index("share_viewers_viewer_idx").on(t.viewerId),
  ],
);
