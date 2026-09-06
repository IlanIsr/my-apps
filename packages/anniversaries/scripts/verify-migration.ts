/**
 * Verify the Firestore → Neon migration.
 *
 *   pnpm --filter @repo/anniversaries verify-migration
 *
 * Compares the production Firestore `persons` collection with the Neon database:
 *   - person counts
 *   - id sets (reports ids missing from Neon, and extra ids in Neon)
 *   - per-person member and event counts
 *
 * Exits non-zero if any Firestore person is missing from Neon, or if a member /
 * event count differs. Extra persons in Neon are reported as a warning only
 * (they may have been added directly since the migration).
 */

import { isStoreConfigured, listPersons } from "../src/store";
import {
  firestoreSourceInfo,
  listFirestorePersons,
} from "./lib/firestore-source";

async function main() {
  if (!isStoreConfigured()) {
    console.error("DATABASE_URL is not set — cannot reach the Neon database.");
    process.exit(1);
  }
  if (!firestoreSourceInfo()) {
    console.error("Firestore source credentials not set.");
    process.exit(1);
  }

  const [firestore, neon] = await Promise.all([
    listFirestorePersons(),
    listPersons(),
  ]);

  const neonById = new Map(neon.map((p) => [p.id, p]));
  const fsIds = new Set(firestore.map((p) => p.id));

  console.log(`Firestore persons: ${firestore.length}`);
  console.log(`Neon persons:      ${neon.length}\n`);

  let problems = 0;

  const missing = firestore.filter((p) => !neonById.has(p.id));
  if (missing.length > 0) {
    problems += missing.length;
    console.error(`MISSING from Neon (${missing.length}):`);
    for (const p of missing) console.error(`  ${p.id}  ${p.name}`);
  }

  const extra = neon.filter((p) => !fsIds.has(p.id));
  if (extra.length > 0) {
    console.warn(
      `\nExtra in Neon, not in Firestore (${extra.length}) — warning only:`,
    );
    for (const p of extra) console.warn(`  ${p.id}  ${p.name}`);
  }

  const countMismatches: string[] = [];
  for (const fs of firestore) {
    const n = neonById.get(fs.id);
    if (!n) continue;
    const fsGoogleIds = new Set(
      fs.events.map((e) => e.googleEventId).filter(Boolean),
    );
    const nGoogleIds = new Set(
      n.events.map((e) => e.googleEventId).filter(Boolean),
    );
    const missingGoogleIds = [...fsGoogleIds].filter(
      (id) => !nGoogleIds.has(id),
    );

    if (n.members.length !== fs.members.length) {
      countMismatches.push(
        `  ${fs.id} ${fs.name}: members ${fs.members.length} (Firestore) vs ${n.members.length} (Neon)`,
      );
    }
    if (n.events.length !== fs.events.length) {
      countMismatches.push(
        `  ${fs.id} ${fs.name}: events ${fs.events.length} (Firestore) vs ${n.events.length} (Neon)`,
      );
    }
    if (missingGoogleIds.length > 0) {
      countMismatches.push(
        `  ${fs.id} ${fs.name}: googleEventId(s) missing in Neon: ${missingGoogleIds.join(", ")}`,
      );
    }
  }
  if (countMismatches.length > 0) {
    problems += countMismatches.length;
    console.error(`\nCount / id mismatches (${countMismatches.length}):`);
    for (const m of countMismatches) console.error(m);
  }

  if (problems === 0) {
    console.log(
      "\n✓ Migration verified: every Firestore person is in Neon with matching member / event counts.",
    );
    return;
  }
  console.error(`\n✗ ${problems} problem(s) found.`);
  process.exit(1);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
