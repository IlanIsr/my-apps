/**
 * A user's anniversaries as an iCalendar (RFC 5545) feed — what Apple Calendar,
 * Outlook or Google subscribe to via `webcal://…/feed/<token>.ics`. Read-only
 * and one-way: the subscriber's app re-fetches it on its own schedule.
 *
 * One `VEVENT` per occurrence (not a recurring series — every year has its own
 * time), spanning the Hebrew day like the Google Calendar events: tzeit
 * hakochavim on the eve → shkia the next day (≈ 23h18 later, since tzeit is 42
 * minutes after sunset). Times are written in UTC so no `VTIMEZONE` is needed.
 */

import type { AnniversaryType } from "./person";

/** Tzeit (sunset + 42 min) → the next day's sunset. */
const HEBREW_DAY_MS = (24 * 60 - 42) * 60_000;

export type FeedPerson = {
  id: string;
  name: string;
  type: AnniversaryType;
  hebDateLabel: string;
  events: { year: number; date: string; time: string }[];
};

export type FeedInput = {
  /** IANA timezone the event times are in (the owner's profile city). */
  timezone: string;
  /** Calendar name shown by the subscriber's app. */
  calendarName: string;
  persons: FeedPerson[];
  /** Pre-translated event title. */
  summary: (type: AnniversaryType, name: string) => string;
  /** Link back to a person's page, e.g. `https://anniversaries.dev/anniversaries/<id>`. */
  personUrl: (id: string) => string;
};

/** Offset (ms) of `timezone` from UTC at instant `utcMs`. */
function zoneOffset(utcMs: number, timezone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(utcMs));
  const n = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);
  return (
    Date.UTC(
      n("year"),
      n("month") - 1,
      n("day"),
      n("hour"),
      n("minute"),
      n("second"),
    ) - utcMs
  );
}

/** `2027-10-03` + `18:31` in `timezone` → the UTC instant (ms). */
function zonedToUtc(date: string, time: string, timezone: string): number {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const wall = Date.UTC(y ?? 0, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0);
  // Two passes settle the offset across a DST change.
  const first = wall - zoneOffset(wall, timezone);
  return wall - zoneOffset(first, timezone);
}

/** `20271003T163100Z`. */
function icalUtc(ms: number): string {
  return new Date(ms).toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
}

function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** Folds a content line at 75 octets (RFC 5545 §3.1), never splitting a character. */
function fold(line: string): string {
  const encoder = new TextEncoder();
  const out: string[] = [];
  let current = "";
  let size = 0;
  for (const char of line) {
    const bytes = encoder.encode(char).length;
    if (size + bytes > (out.length ? 74 : 75)) {
      out.push(current);
      current = "";
      size = 0;
    }
    current += char;
    size += bytes;
  }
  out.push(current);
  return out.join("\r\n ");
}

export function buildCalendarFeed(input: FeedInput): string {
  const stamp = icalUtc(Date.now());
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//anniversaries.dev//Anniversaries//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(input.calendarName)}`,
    `X-WR-TIMEZONE:${input.timezone}`,
    "REFRESH-INTERVAL;VALUE=DURATION:PT6H",
    "X-PUBLISHED-TTL:PT6H",
  ];
  for (const person of input.persons) {
    const summary = escapeText(input.summary(person.type, person.name));
    const url = input.personUrl(person.id);
    for (const event of person.events) {
      const start = zonedToUtc(
        event.date,
        event.time || "18:00",
        input.timezone,
      );
      lines.push(
        "BEGIN:VEVENT",
        `UID:${person.id}-${event.year}@anniversaries.dev`,
        `DTSTAMP:${stamp}`,
        `DTSTART:${icalUtc(start)}`,
        `DTEND:${icalUtc(start + HEBREW_DAY_MS)}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${escapeText(`${person.hebDateLabel} ${event.year}`)}`,
        `URL:${url}`,
        "TRANSP:TRANSPARENT",
        "END:VEVENT",
      );
    }
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}
