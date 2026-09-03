/** Shared types + Google Calendar "anniversary event" tagging + identity. */

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
};

export type Anniversary = {
  /** URL-safe id derived from the name + Hebrew date. */
  id: string;
  name: string;
  hebDate: { day: number; month: string };
  /** e.g. "24 Kislev". */
  hebDateLabel: string;
  /** Everyone on the family list for this person (event attendees). */
  members: string[];
  /** Whether the current user is on the list. */
  joined: boolean;
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

export function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Identity of an anniversary — same normalized name + same Hebrew day/month is
 * the same person. Also the URL slug.
 */
export function anniversaryKey(name: string, hebDay: number, hebMonth: string): string {
  const slug = normalizeName(name).replace(/[^a-z0-9֐-׿]+/g, "-").replace(/^-|-$/g, "");
  return `${slug || "x"}--${hebDay}-${hebMonth.trim().toLowerCase().replace(/\s+/g, "-")}`;
}
