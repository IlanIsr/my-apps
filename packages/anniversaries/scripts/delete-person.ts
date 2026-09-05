/**
 * Delete a person and all their events — from Firestore AND the shared Google
 * Calendar. For when an anniversary was created wrong and you want to re-add it
 * from scratch (the app itself never deletes).
 *
 * Matches on normalized name (case / whitespace-insensitive). Dry run by
 * default; pass --commit to actually delete.
 *
 * Run from the repo root:
 *   pnpm --filter @repo/anniversaries delete-person "Salomon Bellaiche"
 *   pnpm --filter @repo/anniversaries delete-person "Salomon Bellaiche" --commit
 */

import { deleteEvent, listAllEvents } from "../src/calendar";
import { normalizeName } from "../src/person";
import { deletePerson, isStoreConfigured, listPersons } from "../src/store";

const args = process.argv.slice(2);
const commit = args.includes("--commit");
const name = args.filter((a) => !a.startsWith("--")).join(" ").trim();

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Delete an event, tolerating "already gone" (404 / 410). */
async function deleteEventSafe(id: string): Promise<boolean> {
  try {
    await deleteEvent(id);
    return true;
  } catch (error) {
    const message = (error as Error).message;
    if (/\b(404|410)\b/.test(message)) return false; // already gone
    console.warn(`  failed to delete event ${id}: ${message}`);
    return false;
  }
}

async function main() {
  if (!name) {
    console.error('Usage: delete-person "<full name>" [--commit]');
    process.exit(1);
  }
  if (!isStoreConfigured()) {
    console.error(
      "FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY not set.",
    );
    process.exit(1);
  }

  const target = normalizeName(name);

  const persons = await listPersons();
  const matches = persons.filter((p) => normalizeName(p.name) === target);

  // Every calendar event that belongs to a matched person: by the personId tag,
  // and (belt-and-braces) by a title that mentions the name.
  const matchedIds = new Set(matches.map((p) => p.id));
  const allEvents = await listAllEvents();
  const eventsToDelete = allEvents.filter((e) => {
    const personId = e.extendedProperties?.private?.personId;
    if (personId && matchedIds.has(personId)) return true;
    return (e.summary ?? "").toLowerCase().includes(name.toLowerCase());
  });

  console.log(
    `Match for "${name}": ${matches.length} person doc(s), ` +
      `${eventsToDelete.length} calendar event(s). Mode: ${
        commit ? "DELETE" : "dry run"
      }\n`,
  );
  for (const p of matches) {
    console.log(
      `  persons/${p.id}  ${p.name}  (${p.type}, ${p.hebDate.day} ${p.hebDate.month})  ` +
        `${p.events.length} stored events  members: ${p.members.join(", ") || "none"}`,
    );
  }
  for (const e of eventsToDelete) {
    const when = (e.start?.dateTime ?? e.start?.date ?? "").slice(0, 10);
    console.log(`  event ${e.id}  ${when}  ${e.summary ?? "(no title)"}`);
  }

  if (matches.length === 0 && eventsToDelete.length === 0) {
    console.log("Nothing to delete.");
    return;
  }

  if (!commit) {
    console.log("\nRe-run with --commit to delete.");
    return;
  }

  let deletedEvents = 0;
  for (const e of eventsToDelete) {
    if (await deleteEventSafe(e.id)) deletedEvents++;
    await sleep(120); // the Calendar API rate-limits bursts
  }

  for (const p of matches) {
    await deletePerson(p.id);
    console.log(`  deleted persons/${p.id}`);
  }

  console.log(
    `\nDeleted ${deletedEvents} calendar event(s) and ${matches.length} person doc(s).`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
