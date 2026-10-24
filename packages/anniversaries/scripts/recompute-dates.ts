/**
 * Re-apply the anniversary date rules (a single-Adar birthday falls in Adar II
 * of a leap year, 30th of a short month, …) to every stored person and fix
 * their stored occurrences + calendar series. Needed once after the rules
 * change; the app applies them itself to anything created or edited later.
 *
 * Dry run by default; pass --commit to write the store and re-sync the
 * calendar (silently — no invite emails).
 *
 * Run from the repo root:
 *   pnpm --filter @repo/anniversaries recompute-dates
 *   pnpm --filter @repo/anniversaries recompute-dates --commit
 */

import { recomputeAllOccurrences } from "../src/service";

const commit = process.argv.includes("--commit");

const fixes = await recomputeAllOccurrences(commit);
for (const fix of fixes) {
  const [from, to] = fix.month;
  console.log(
    `${fix.name} (${fix.id})${from === to ? "" : ` — month ${from} → ${to}`}`,
  );
  for (const change of fix.changes) console.log(`  ${change}`);
}
console.log(
  fixes.length === 0
    ? "Nothing to fix."
    : `${fixes.length} person(s) ${commit ? "fixed" : "to fix — re-run with --commit"}.`,
);
