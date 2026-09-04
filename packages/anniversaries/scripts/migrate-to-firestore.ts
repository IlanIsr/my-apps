/**
 * One-time migration: Google-Calendar-as-source-of-truth → Firestore.
 *
 * Reads every event on the shared bot calendar, groups the ones carrying the
 * old JSON description tag into `persons` documents, and (with --commit) writes
 * them to Firestore + rewrites each future event's description to a clean tag
 * with `extendedProperties.private.personId`.
 *
 * Past events are left untouched.
 *
 * Run from the repo root with env loaded:
 *   pnpm --filter @repo/anniversaries migrate           # dry run
 *   pnpm --filter @repo/anniversaries migrate --commit  # write
 */

import {
  calculateNextOccurrences,
  hebrewYearForGregorian,
  parseHebrewDate,
  toHebrewMonthKey,
  type HebrewMonthKey,
} from "@repo/hebcal";

import {
  listAllEvents,
  rewriteEventTag,
  type GoogleEvent,
} from "../src/calendar";
import { decodeLegacyDescription } from "../src/legacy-tag";
import { anniversaryKey } from "../src/person";
import {
  createPerson,
  isStoreConfigured,
  listPersons,
  updatePerson,
  type StoredEvent,
} from "../src/store";

const commit = process.argv.includes("--commit");

function today(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function eventDate(event: GoogleEvent): string {
  return (event.start?.dateTime ?? "").slice(0, 10) || (event.start?.date ?? "");
}

function eventTime(event: GoogleEvent): string {
  return (event.start?.dateTime ?? "").slice(11, 16);
}

/** The occurrence's Hebrew year is that of the day after the eve. */
function occurrenceYear(iso: string): number {
  const parts = iso.split("-").map(Number);
  const y = parts[0];
  const m = parts[1];
  const d = parts[2];
  if (!y || !m || !d) return 0;
  const next = new Date(y, m - 1, d + 1);
  return hebrewYearForGregorian(
    next.getFullYear(),
    next.getMonth() + 1,
    next.getDate(),
  );
}

type Group = {
  name: string;
  hebDay: number;
  hebMonth: HebrewMonthKey;
  members: Set<string>;
  events: GoogleEvent[];
};

async function main() {
  if (!isStoreConfigured()) {
    console.error(
      "FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY not set.",
    );
    process.exit(1);
  }

  if (commit) {
    let existing: Awaited<ReturnType<typeof listPersons>>;
    try {
      existing = await listPersons();
    } catch (error) {
      console.error(
        "Could not reach the Firestore database. Check FIREBASE_* creds and " +
          "that the named database exists (FIREBASE_DATABASE_ID, default 'app-1').\n",
        error,
      );
      process.exit(1);
    }
    if (existing.length > 0) {
      console.error(
        `The 'persons' collection already has ${existing.length} document(s). ` +
          "Refusing to migrate on top of existing data — clear it first if this is a re-run.",
      );
      process.exit(1);
    }
  }

  const all = await listAllEvents();
  const groups = new Map<string, Group>();

  for (const event of all) {
    const tag = decodeLegacyDescription(event.description);
    if (!tag) continue;
    const hd = parseHebrewDate(tag.hebDateLabel);
    if (!hd) continue;
    const hebMonth = toHebrewMonthKey(hd.month) as HebrewMonthKey;
    const key = anniversaryKey(tag.name, hd.day, hebMonth);

    const group: Group = groups.get(key) ?? {
      name: tag.name,
      hebDay: hd.day,
      hebMonth,
      members: new Set<string>(),
      events: [],
    };
    for (const a of event.attendees ?? []) {
      if (a.email) group.members.add(a.email.toLowerCase());
    }
    group.events.push(event);
    groups.set(key, group);
  }

  const cutoff = today();
  console.log(
    `${groups.size} people from ${all.length} calendar events. Mode: ${
      commit ? "COMMIT" : "dry run"
    }\n`,
  );

  for (const group of groups.values()) {
    const future = group.events
      .filter((e) => eventDate(e) >= cutoff)
      .sort((a, b) => eventDate(a).localeCompare(eventDate(b)));

    const occ = new Map(
      calculateNextOccurrences(group.hebDay, group.hebMonth, 80).map((o) => [
        o.date,
        o.hebrewYear,
      ]),
    );

    const events: StoredEvent[] = future.map((e) => {
      const date = eventDate(e);
      return {
        year: occ.get(date) ?? occurrenceYear(date),
        date,
        time: eventTime(e),
        googleEventId: e.id,
        htmlLink: e.htmlLink ?? "",
        manual: occ.has(date) ? undefined : true,
      };
    });

    console.log(
      `• ${group.name}  (${group.hebDay} ${group.hebMonth})  ` +
        `${[...group.members].join(", ") || "no members"}  ` +
        `${events.length} future / ${group.events.length} total events`,
    );

    if (!commit) continue;

    const record = await createPerson({
      name: group.name.trim(),
      type: "birthday", // legacy data predates the birthday/yahrzeit split
      hebDate: { day: group.hebDay, month: group.hebMonth },
      members: [...group.members],
      createdBy: "migration",
    });
    await updatePerson(record.id, { events });
    for (const e of events) {
      await rewriteEventTag(e.googleEventId, record.id);
    }
    console.log(`  → persons/${record.id}`);
  }

  console.log("\nDone.");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
