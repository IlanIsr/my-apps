/**
 * One-time import of the original "Classeur Panini" artifact album (a JSON
 * export of its `album/data` document) into a user's account.
 *
 *   pnpm --filter panini import-artifact <export.json> --owner <clerkUserId>            # dry run
 *   pnpm --filter panini import-artifact <export.json> --owner <clerkUserId> --commit   # write
 *
 * Targets the `DATABASE_URL` in apps/panini/.env (or the environment). Refuses
 * if the user already has an album — never overwrites, never duplicates. The
 * whole write is one transaction (`db.batch`).
 */

import { readFileSync } from "node:fs";

import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "../db/schema";
import { COLLECTOR_COLORS, RESERVE_COLOR } from "../lib/album-logic";

type ArtifactAlbum = {
  name: string;
  cardsPerPage: number;
  cards: {
    code: string;
    page: number;
    label?: string;
    c: Record<string, number>;
  }[];
};

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--") && a !== ownerArg());
const owner = ownerArg();
const commit = args.includes("--commit");

function ownerArg() {
  const i = process.argv.indexOf("--owner");
  return i > 0 ? process.argv[i + 1] : undefined;
}

if (!file || !owner) {
  console.error(
    "usage: import-artifact <export.json> --owner <clerkUserId> [--commit]",
  );
  process.exit(1);
}
const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set (apps/panini/.env).");
  process.exit(1);
}

const raw = JSON.parse(readFileSync(file, "utf8"));
// Accept either the bare document or the `{ data: … }` export wrapper.
const src: ArtifactAlbum = raw.cards ? raw : raw.data;
if (!src?.cards?.length) {
  console.error("No cards found in", file);
  process.exit(1);
}

const db = drizzle(neon(url), { schema });

const [existing] = await db
  .select({ id: schema.albums.id })
  .from(schema.albums)
  .where(eq(schema.albums.ownerId, owner));
if (existing) {
  console.error(
    `User ${owner} already has an album (${existing.id}) — refusing.`,
  );
  process.exit(1);
}

// Kids = every count key except `reserve`. The original artifact's three kids
// keep their order (and so their rose / blue / amber colours); others follow.
const ORIGINAL_ORDER = ["ayala", "odelia", "betsalel"];
const rank = (k: string) =>
  ORIGINAL_ORDER.includes(k)
    ? ORIGINAL_ORDER.indexOf(k)
    : ORIGINAL_ORDER.length;
const kidKeys = [...new Set(src.cards.flatMap((c) => Object.keys(c.c)))]
  .filter((k) => k !== "reserve")
  .sort((a, b) => rank(a) - rank(b));

const albumId = crypto.randomUUID();
const collectorIds = new Map<string, string>();
const collectorRows: (typeof schema.collectors.$inferInsert)[] = kidKeys.map(
  (key, i) => {
    const id = crypto.randomUUID();
    collectorIds.set(key, id);
    return {
      id,
      albumId,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      color: COLLECTOR_COLORS[i % COLLECTOR_COLORS.length]!,
      position: i,
    };
  },
);
const reserveId = crypto.randomUUID();
collectorIds.set("reserve", reserveId);
collectorRows.push({
  id: reserveId,
  albumId,
  name: "Réserve",
  color: RESERVE_COLOR,
  position: 0,
  isReserve: true,
});

const seen = new Set<string>();
const cardRows: (typeof schema.cards.$inferInsert)[] = [];
const countRows: (typeof schema.cardCounts.$inferInsert)[] = [];
for (const card of src.cards) {
  const code = String(card.code).trim();
  if (!code || seen.has(code)) continue;
  seen.add(code);
  const id = crypto.randomUUID();
  cardRows.push({
    id,
    albumId,
    code,
    page: card.page,
    label: card.label ?? "",
  });
  for (const [key, count] of Object.entries(card.c)) {
    if (count > 0) {
      countRows.push({
        cardId: id,
        collectorId: collectorIds.get(key)!,
        count,
      });
    }
  }
}

console.log(`Album "${src.name}" (${src.cardsPerPage}/page) → owner ${owner}`);
console.log(`  collectors: ${collectorRows.map((c) => c.name).join(", ")}`);
console.log(
  `  cards: ${cardRows.length} (${src.cards.length - cardRows.length} duplicate/empty codes skipped)`,
);
console.log(`  non-zero counts: ${countRows.length}`);

if (!commit) {
  console.log("Dry run — pass --commit to write.");
  process.exit(0);
}

const chunk = <T>(rows: T[], size = 500) =>
  Array.from({ length: Math.ceil(rows.length / size) }, (_, i) =>
    rows.slice(i * size, (i + 1) * size),
  );

await db.batch([
  db.insert(schema.albums).values({
    id: albumId,
    ownerId: owner,
    name: src.name,
    cardsPerPage: src.cardsPerPage,
  }),
  db.insert(schema.collectors).values(collectorRows),
  ...chunk(cardRows).map((rows) => db.insert(schema.cards).values(rows)),
  ...chunk(countRows).map((rows) => db.insert(schema.cardCounts).values(rows)),
]);
console.log("Imported.");
