/** Domain types for anniversaries + person identity helpers. */

import type { HebrewMonthKey } from "@repo/hebcal";

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
  hebrewName?: string;
  origin?: string;
  hebDate: { day: number; month: HebrewMonthKey };
  /** e.g. "24 Kislev" — derived from `hebDate`. */
  hebDateLabel: string;
  /** Everyone on the family list for this person (lowercased emails). */
  members: string[];
  /** Whether the current viewer's email is on the list. */
  joined: boolean;
  /** Upcoming events, ascending by date. */
  events: AnniversaryEvent[];
};

export function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Identity of an anniversary — same normalized name + same Hebrew day/month is
 * the same person. Used to dedupe on add.
 */
export function anniversaryKey(
  name: string,
  hebDay: number,
  hebMonth: string,
): string {
  const slug = normalizeName(name)
    .replace(/[^a-z0-9֐-׿]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${slug || "x"}--${hebDay}-${hebMonth.trim().toLowerCase().replace(/\s+/g, "-")}`;
}

/** `{ day, month }` → `"24 Kislev"`. */
export function formatHebDateLabel(hebDate: {
  day: number;
  month: string;
}): string {
  return `${hebDate.day} ${hebDate.month}`;
}
