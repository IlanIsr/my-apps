/** Domain types for anniversaries + person identity helpers. */

import type { HebrewMonthKey } from "@repo/hebcal";

/** What an anniversary marks. Drives the calendar title, colour, and UI accent. */
export type AnniversaryType = "birthday" | "yahrzeit";

/** One upcoming occurrence of a person's anniversary, as shown to the app. */
export type AnniversaryEvent = {
  /** Google Calendar event id (empty only in the brief window before sync). */
  id: string;
  /** Hebrew year of this occurrence — the stable per-occurrence key. */
  year: number;
  /** Gregorian eve date, ISO `YYYY-MM-DD`. */
  date: string;
  /** Start time `HH:MM` (tzeit hakochavim, or a manual override). */
  time?: string;
  /** Link to the event in Google Calendar. */
  htmlLink?: string;
};

/**
 * A person and their anniversary. Backed by a `persons/{id}` Firestore
 * document; the calendar events are a projection of it.
 */
export type Anniversary = {
  /** Firestore document id. */
  id: string;
  name: string;
  type: AnniversaryType;
  hebrewName?: string;
  origin?: string;
  /** Hebrew year of birth (birthday) or passing (yahrzeit). Optional — not
   * needed to compute occurrences; only used to show an age / years-since count. */
  hebYear?: number;
  hebDate: { day: number; month: HebrewMonthKey };
  /** e.g. "24 Kislev" — derived from `hebDate`. */
  hebDateLabel: string;
  /** Family list for this person (lowercased emails). Empty unless the viewer
   * is an admin — non-admins never receive other members' addresses. */
  members: string[];
  /** Whether the current viewer's email is on the list. */
  joined: boolean;
  /** Whether the current viewer is an anniversaries admin (the shared account). */
  admin: boolean;
  /** Upcoming events, ascending by date. */
  events: AnniversaryEvent[];
};

export function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Identity of an anniversary — same normalized name + same Hebrew day/month +
 * same type is the same person. Used to dedupe on add.
 */
export function anniversaryKey(
  name: string,
  hebDay: number,
  hebMonth: string,
  type: AnniversaryType = "birthday",
): string {
  const slug = normalizeName(name)
    .replace(/[^a-z0-9֐-׿]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug || "x"}--${hebDay}-${hebMonth.trim().toLowerCase().replace(/\s+/g, "-")}--${type}`;
}

/**
 * Years between a base Hebrew year (birth / passing) and an occurrence's Hebrew
 * year — i.e. the age on a birthday or the "Nth" yahrzeit. `null` when no base
 * year is known.
 */
export function occurrencesSince(
  baseHebYear: number | undefined,
  occurrenceHebYear: number,
): number | null {
  if (!baseHebYear || !Number.isFinite(baseHebYear)) return null;
  const n = occurrenceHebYear - baseHebYear;
  return n >= 0 ? n : null;
}

/** `{ day, month }` → `"24 Kislev"`. */
export function formatHebDateLabel(hebDate: {
  day: number;
  month: string;
}): string {
  return `${hebDate.day} ${hebDate.month}`;
}
