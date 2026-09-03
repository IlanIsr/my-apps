/** Shared types + Google Calendar "anniversary event" tagging. */

export type AnniversaryEvent = {
  /** Google Calendar event id. */
  id: string;
  /** The event's Gregorian date (`YYYY-MM-DD`) — the eve of the Hebrew date. */
  date: string;
  summary: string;
  /** ISO start, e.g. "2026-12-03T17:17:00+02:00". */
  startDateTime: string;
  htmlLink: string;
  /** Start time `HH:MM` (tzeit hakochavim, or a custom time). */
  time?: string;
  /** Attendee emails the event is shared with. */
  shared: string[];
};

export type Anniversary = {
  /** Slug of the normalized name; stable id used in URLs. */
  id: string;
  name: string;
  hebDate: { day: number; month: string };
  /** e.g. "24 Kislev". */
  hebDateLabel: string;
  shared: string[];
  /** All calendar events for this person, ascending by date. */
  events: AnniversaryEvent[];
};

const TAG_TYPE = "anniversaire";
const TAG_ORIGIN = "hebreu";

/** JSON blob stored in the event description that marks it as one of ours. */
export function encodeAnniversaryDescription(
  name: string,
  hebDateLabel: string,
): string {
  return JSON.stringify(
    { type: TAG_TYPE, nom: name, origine: TAG_ORIGIN, hebrew_date: hebDateLabel },
    null,
    2,
  );
}

export function decodeAnniversaryDescription(
  description: string | null | undefined,
): { name: string; hebDateLabel: string } | null {
  if (!description) return null;
  try {
    const d = JSON.parse(description) as Record<string, unknown>;
    if (
      d.type === TAG_TYPE &&
      d.origine === TAG_ORIGIN &&
      typeof d.nom === "string" &&
      typeof d.hebrew_date === "string"
    ) {
      return { name: d.nom, hebDateLabel: d.hebrew_date };
    }
  } catch {
    // not JSON / not ours
  }
  return null;
}

/** URL-safe stable id for a person (keeps Latin + Hebrew letters). */
export function anniversaryId(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9֐-׿-]/g, "");
}
