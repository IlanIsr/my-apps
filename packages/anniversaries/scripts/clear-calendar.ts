/**
 * Delete every event on the shared bot calendar
 * (`anniversaries.calendar@gmail.com`). A clean slate for testing.
 *
 * Run from the repo root:
 *   pnpm --filter @repo/anniversaries clear-calendar           # dry run
 *   pnpm --filter @repo/anniversaries clear-calendar --commit  # delete
 */

import { deleteEvent, listAllEvents } from "../src/calendar";

const commit = process.argv.includes("--commit");

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const events = await listAllEvents();
  console.log(
    `${events.length} events on the shared calendar. Mode: ${
      commit ? "DELETE" : "dry run"
    }\n`,
  );
  for (const e of events) {
    const when = (e.start?.dateTime ?? e.start?.date ?? "").slice(0, 10);
    console.log(`  ${when}  ${e.summary ?? "(no title)"}`);
  }

  if (!commit) {
    console.log("\nRe-run with --commit to delete.");
    return;
  }

  // Delete one at a time with a small delay — the Calendar API rate-limits
  // bursts of writes and silently drops some.
  let deleted = 0;
  for (let pass = 1; pass <= 6; pass++) {
    const remaining = await listAllEvents();
    if (remaining.length === 0) break;
    console.log(`\nPass ${pass}: ${remaining.length} to delete`);
    for (const e of remaining) {
      try {
        await deleteEvent(e.id);
        deleted++;
      } catch (error) {
        console.warn(`  failed ${e.id}: ${(error as Error).message}`);
      }
      await sleep(120);
    }
  }

  const left = await listAllEvents();
  console.log(`\nDeleted ${deleted} events. ${left.length} remaining.`);
  if (left.length > 0) process.exit(1);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
