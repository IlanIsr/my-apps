/**
 * One-time migration: production Firestore (`persons` collection) → Neon / Postgres.
 *
 *   pnpm --filter @repo/anniversaries migrate-firestore-to-neon           # dry run
 *   pnpm --filter @repo/anniversaries migrate-firestore-to-neon --commit  # write
 *
 * Reads from the prod Firebase project (default `my-app-1-312d0`, named database
 * `app-1`) using read-only service-account creds in env (`PROD_FIREBASE_*` /
 * `MIGRATE_FIREBASE_*` / `FIREBASE_*`). Writes to Neon via `DATABASE_URL`.
 *
 * Idempotent: every person is upserted by id; its members / events are replaced.
 * Document ids, `googleEventId`s, dates, Hebrew-date fields, `type`, `hebYear`,
 * `origin`, `hebrewName` and `key` are all preserved verbatim. Nothing is
 * deleted from Firestore, and Google Calendar is never touched.
 */

import { isStoreConfigured, listPersons, upsertPerson } from "../src/store";
import {
  firestoreSourceInfo,
  listFirestorePersons,
} from "./lib/firestore-source";

const commit = process.argv.includes("--commit");

async function main() {
  if (!isStoreConfigured()) {
    console.error("DATABASE_URL is not set — cannot reach the Neon database.");
    process.exit(1);
  }
  const info = firestoreSourceInfo();
  if (!info) {
    console.error(
      "Firestore source credentials not set (PROD_FIREBASE_CLIENT_EMAIL / " +
        "PROD_FIREBASE_PRIVATE_KEY, or the MIGRATE_ / FIREBASE_ equivalents).",
    );
    process.exit(1);
  }

  console.log(
    `Source: Firestore ${info.projectId} / db "${info.databaseId}"\n` +
      `Target: Neon (DATABASE_URL)\n` +
      `Mode:   ${commit ? "COMMIT" : "dry run"}\n`,
  );

  const source = await listFirestorePersons();
  console.log(`${source.length} person document(s) in Firestore.\n`);

  const before = commit ? await listPersons() : [];
  const beforeIds = new Set(before.map((p) => p.id));

  let written = 0;
  for (const record of source) {
    const label =
      `• ${record.id}  ${record.name}  (${record.type}, ` +
      `${record.hebDate.day} ${record.hebDate.month})  ` +
      `${record.members.length} member(s), ${record.events.length} event(s)`;
    if (!commit) {
      console.log(label);
      continue;
    }
    try {
      await upsertPerson(record);
      written++;
      console.log(
        `${label}  → ${beforeIds.has(record.id) ? "updated" : "inserted"}`,
      );
    } catch (error) {
      console.error(`  FAILED for ${record.id}:`, error);
      process.exitCode = 1;
    }
  }

  if (!commit) {
    console.log("\nRe-run with --commit to write to Neon.");
    return;
  }

  const after = await listPersons();
  console.log(
    `\nDone. Upserted ${written}/${source.length}. ` +
      `Neon now has ${after.length} person(s) (was ${before.length}).`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
