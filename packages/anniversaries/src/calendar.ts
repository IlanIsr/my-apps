/**
 * Google Calendar I/O against the shared bot calendar
 * (`anniversaries.calendar@gmail.com`). The calendar is a **projection** of the
 * Postgres store: `syncPersonEvents` reconciles a person's events to match what
 * the store says they should be, and (with `notify`) can email the attendees an
 * invite via `sendUpdates=all`.
 *
 * Each person is **one recurring event**: its first occurrence is the start,
 * every other one an `RDATE` date-time (each with its own tzeit hakochavim
 * time). So joining sends a single invite for all the years at once. A person
 * has one such series per reference city its members use (`location`) — the
 * caller picks the members and the series of each city.
 *
 * Authenticates AS the bot account via `google-auth-library` + a stored refresh
 * token; talks to the Calendar REST API with `fetch`.
 */

import { OAuth2Client } from "google-auth-library";

import {
  getShkiaWithFallback,
  getTsetHakohavimWithFallback,
  JERUSALEM,
  type ZmanimLocation,
} from "@repo/hebcal";
import { sleep } from "@repo/utils";

const EVENT_COLOR_ID = "5";
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID ?? "primary";

const eventsUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
  CALENDAR_ID,
)}/events`;

export class CalendarNotConfiguredError extends Error {
  constructor() {
    super("shared-calendar-not-configured");
    this.name = "CalendarNotConfiguredError";
  }
}

export class CalendarRateLimitError extends Error {
  constructor() {
    super("calendar-rate-limited");
    this.name = "CalendarRateLimitError";
  }
}

/** Run `fn` over `items`, at most `limit` at a time. */
async function pool<T>(
  limit: number,
  items: readonly T[],
  fn: (item: T) => Promise<void>,
): Promise<void> {
  const queue = items.slice();
  const worker = async () => {
    for (let item = queue.shift(); item !== undefined; item = queue.shift()) {
      await fn(item);
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  );
}

let cachedClient: OAuth2Client | null = null;

function botClient(): OAuth2Client {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    const missing = [
      !clientId && "GOOGLE_CLIENT_ID",
      !clientSecret && "GOOGLE_CLIENT_SECRET",
      !refreshToken && "GOOGLE_REFRESH_TOKEN",
    ]
      .filter(Boolean)
      .join(", ");
    console.error(
      `[anniversaries] Google Calendar not configured: missing ${missing}`,
    );
    throw new CalendarNotConfiguredError();
  }
  if (!cachedClient) {
    cachedClient = new OAuth2Client({ clientId, clientSecret });
    cachedClient.setCredentials({ refresh_token: refreshToken });
  }
  return cachedClient;
}

async function botToken(): Promise<string> {
  const { token } = await botClient().getAccessToken();
  if (!token) throw new CalendarNotConfiguredError();
  return token;
}

function isRateLimited(status: number, body: string): boolean {
  if (status === 429) return true;
  if (status === 403) {
    return /rateLimitExceeded|userRateLimitExceeded|quotaExceeded/i.test(body);
  }
  return status >= 500;
}

async function calendarApi<T>(path: string, init?: RequestInit): Promise<T> {
  const MAX_ATTEMPTS = 5;
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(`${eventsUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${await botToken()}`,
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
    if (response.ok) {
      return response.status === 204
        ? (undefined as T)
        : ((await response.json()) as T);
    }

    const body = await response.text();
    if (attempt < MAX_ATTEMPTS - 1 && isRateLimited(response.status, body)) {
      // Exponential backoff with jitter: ~0.6s, 1.4s, 3s, 6s.
      await sleep(2 ** attempt * 600 + Math.random() * 400);
      continue;
    }
    if (isRateLimited(response.status, body))
      throw new CalendarRateLimitError();
    throw new Error(`Google Calendar API ${response.status}: ${body}`);
  }
}

/** Whether the shared bot calendar is configured and reachable. */
export async function isCalendarReachable(): Promise<boolean> {
  try {
    const response = await fetch(`${eventsUrl}?maxResults=1`, {
      headers: { Authorization: `Bearer ${await botToken()}` },
    });
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error(
        `[anniversaries] Google Calendar check failed: HTTP ${response.status} ${body}`,
      );
    }
    return response.ok;
  } catch (error) {
    console.error("[anniversaries] Google Calendar unreachable:", error);
    return false;
  }
}

type GoogleAttendee = {
  email?: string;
  optional?: boolean;
  responseStatus?: string;
};

export type GoogleEvent = {
  id: string;
  summary?: string;
  description?: string;
  htmlLink?: string;
  start?: { dateTime?: string; date?: string };
  attendees?: GoogleAttendee[];
  extendedProperties?: { private?: Record<string, string> };
};

type AttendeeInput = { email: string; responseStatus?: string };

function mapAttendees(attendees: AttendeeInput[]): Record<string, unknown>[] {
  return attendees.map((a) =>
    a.responseStatus
      ? { email: a.email, optional: true, responseStatus: a.responseStatus }
      : { email: a.email, optional: true },
  );
}

function buildEventBody(fields: {
  summary?: string;
  description?: string;
  date: string;
  time: string;
  /** End of the first occurrence (the next day's shkia). */
  endDate: string;
  endTime: string;
  timezone: string;
  attendees: AttendeeInput[];
  /** Private tags for a new series (`personId`, `location`). */
  tags?: Record<string, string>;
  colorId?: string;
  /** `RRULE`/`RDATE` lines; omit to leave the recurrence untouched. */
  recurrence?: string[];
}): Record<string, unknown> {
  const body: Record<string, unknown> = {
    start: {
      dateTime: `${fields.date}T${fields.time}:00`,
      timeZone: fields.timezone,
    },
    end: {
      dateTime: `${fields.endDate}T${fields.endTime}:00`,
      timeZone: fields.timezone,
    },
    attendees: mapAttendees(fields.attendees),
    guestsCanModify: false,
    guestsCanInviteOthers: false,
    guestsCanSeeOtherGuests: false,
    colorId: fields.colorId ?? EVENT_COLOR_ID,
  };
  if (fields.recurrence) body.recurrence = fields.recurrence;
  if (fields.summary !== undefined) body.summary = fields.summary;
  if (fields.description !== undefined) body.description = fields.description;
  if (fields.tags) body.extendedProperties = { private: fields.tags };
  return body;
}

export type DesiredEvent = {
  year: number;
  /** Gregorian eve date, ISO `YYYY-MM-DD`. */
  date: string;
  /** `HH:MM` (in the series' timezone), or `""` to compute tzeit hakochavim. */
  time: string;
  /** The person's series id (same for every year), or `""` if not created. */
  googleEventId: string;
};

export type SyncedEvent = {
  year: number;
  date: string;
  time: string;
  /** The series id — the same for every year of a person. */
  googleEventId: string;
  htmlLink: string;
};

export type SyncInput = {
  personId: string;
  /**
   * Reference city of this series: its timezone, and where tzeit / shkia are
   * computed. Default Jerusalem. `locationId` tags a new series with it.
   */
  location?: ZmanimLocation;
  locationId?: string;
  /** Pre-translated event title. Omit to leave the existing title untouched. */
  summary?: string;
  /** Title for a brand-new series when `summary` is omitted. */
  summaryFallback: string;
  /** Event description. Omit to leave it untouched. */
  description?: string;
  /** Google Calendar colour id for the series. */
  colorId?: string;
  /** Family member emails (any case). */
  members: string[];
  /** Every occurrence the series should have (past ones included). */
  events: DesiredEvent[];
  /**
   * Subset of `members` (any case) who should be emailed a Google Calendar
   * invite this round — one email for the whole series. Members left out are
   * added/kept as attendees silently (`sendUpdates=none`). Omit or pass `[]`
   * to notify no one.
   */
  notifyEmails?: string[];
};

export type SyncResult = {
  events: SyncedEvent[];
  /** Emails that declined on the shared calendar — treat as "left". */
  declined: string[];
  /** True if the Calendar API rate-limited us before the series was synced. */
  rateLimited: boolean;
  /** The series' title as it now stands on the calendar. */
  summary?: string;
};

/** Gap between Calendar writes — the API throttles bursts to a single calendar. */
const WRITE_GAP_MS = 150;

/** `2027-10-03` → `2027-10-04`. */
function nextDay(date: string): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/** `2027-10-03` + `18:31` → `20271003T183100` (an iCalendar local date-time). */
function icalDateTime(date: string, time: string): string {
  return `${date.replaceAll("-", "")}T${time.replace(":", "")}00`;
}

/**
 * Reconcile a person's recurring Google Calendar event to match `input`: one
 * series whose start is the earliest occurrence and whose `RDATE` lists the
 * others. Creates it if no occurrence carries a series id yet.
 *
 * Each occurrence spans the whole Hebrew day: from tzeit hakochavim on the eve
 * to shkia the next day. Google gives every occurrence of a series the first
 * one's duration, so other years may end a minute or two off their own shkia
 * (tzeit is a fixed 42 minutes after sunset, and sunset moves ≤ ~2 min a day).
 */
export async function syncPersonEvents(input: SyncInput): Promise<SyncResult> {
  const location = input.location ?? JERUSALEM;
  const wanted = [...input.events].sort((a, b) => a.date.localeCompare(b.date));
  const first = wanted[0];
  if (!first) return { events: [], declined: [], rateLimited: false };

  // 1. The existing series, if any (deleted on the calendar → recreate).
  const seriesId = wanted.find((e) => e.googleEventId)?.googleEventId ?? "";
  let found: GoogleEvent | undefined;
  if (seriesId) {
    try {
      found = await calendarApi<GoogleEvent>(
        `/${encodeURIComponent(seriesId)}`,
      );
    } catch (error) {
      if (error instanceof CalendarRateLimitError) {
        return { events: [], declined: [], rateLimited: true };
      }
      // gone from the calendar — it'll be recreated below
    }
  }

  // 2. Anyone who declined the series has left.
  const declined = new Set<string>();
  for (const a of found?.attendees ?? []) {
    if (a.responseStatus === "declined" && a.email) {
      declined.add(a.email.toLowerCase());
    }
  }
  const memberEmails = [
    ...new Set(input.members.map((m) => m.toLowerCase())),
  ].filter((m) => !declined.has(m));

  // 3. Resolve start times (hits hebcal.com, not Google).
  const times = new Map<number, string>();
  await pool(4, wanted, async (want) => {
    times.set(
      want.year,
      want.time ||
        (await getTsetHakohavimWithFallback(want.date, undefined, location)),
    );
  });
  const timeOf = (e: DesiredEvent) => times.get(e.year) ?? "18:00";
  const endDate = nextDay(first.date);
  const endTime = await getShkiaWithFallback(endDate, undefined, location);
  const rest = wanted.slice(1);
  const recurrence = rest.length
    ? [
        `RDATE;TZID=${location.timezone}:${rest
          .map((e) => icalDateTime(e.date, timeOf(e)))
          .join(",")}`,
      ]
    : [];

  // 4. Who gets emailed. When it's everyone or no one, one write suffices.
  //    When it's a genuine mix, adding the to-notify members as a separate
  //    follow-up change is what makes Google email only them — an unaffected
  //    existing attendee isn't renotified just because sendUpdates=all.
  //    Someone already on the series is never re-invited.
  const alreadyInvited = new Set(
    (found?.attendees ?? []).flatMap((a) =>
      a.email ? [a.email.toLowerCase()] : [],
    ),
  );
  const notifySet = new Set(
    (input.notifyEmails ?? [])
      .map((e) => e.toLowerCase())
      .filter((e) => !alreadyInvited.has(e)),
  );
  const toNotify = memberEmails.filter((m) => notifySet.has(m));
  const toKeepSilent = memberEmails.filter((m) => !notifySet.has(m));
  const isSplitNotify = toNotify.length > 0 && toKeepSilent.length > 0;
  const sendUpdates = !isSplitNotify && toNotify.length > 0 ? "all" : "none";
  const firstPassEmails = isSplitNotify ? toKeepSilent : memberEmails;

  const priorStatus = new Map<string, string>();
  for (const a of found?.attendees ?? []) {
    if (a.email && a.responseStatus) {
      priorStatus.set(a.email.toLowerCase(), a.responseStatus);
    }
  }
  const attendeesFor = (emails: string[]): AttendeeInput[] =>
    emails.map((email) => {
      const responseStatus = priorStatus.get(email);
      return responseStatus ? { email, responseStatus } : { email };
    });

  // 5. One write (two when split-notifying) for the whole series.
  let result: GoogleEvent;
  try {
    const body = buildEventBody({
      summary: found ? input.summary : (input.summary ?? input.summaryFallback),
      description: found ? input.description : (input.description ?? ""),
      date: first.date,
      time: timeOf(first),
      endDate,
      endTime,
      timezone: location.timezone,
      attendees: attendeesFor(firstPassEmails),
      tags: found
        ? undefined
        : {
            personId: input.personId,
            ...(input.locationId && { location: input.locationId }),
          },
      colorId: input.colorId,
      recurrence,
    });
    result = found
      ? await calendarApi<GoogleEvent>(
          `/${encodeURIComponent(found.id)}?sendUpdates=${sendUpdates}`,
          { method: "PATCH", body: JSON.stringify(body) },
        )
      : await calendarApi<GoogleEvent>(`?sendUpdates=${sendUpdates}`, {
          method: "POST",
          body: JSON.stringify(body),
        });

    if (isSplitNotify) {
      await sleep(WRITE_GAP_MS);
      result = await calendarApi<GoogleEvent>(
        `/${encodeURIComponent(result.id)}?sendUpdates=all`,
        {
          method: "PATCH",
          body: JSON.stringify({
            attendees: mapAttendees(attendeesFor(memberEmails)),
          }),
        },
      );
    }
  } catch (error) {
    if (error instanceof CalendarRateLimitError) {
      return { events: [], declined: [...declined], rateLimited: true };
    }
    throw error;
  }

  const htmlLink = result.htmlLink ?? found?.htmlLink ?? "";
  return {
    summary: result.summary,
    events: wanted.map((want) => ({
      year: want.year,
      date: want.date,
      time: timeOf(want),
      googleEventId: result.id,
      htmlLink,
    })),
    declined: [...declined],
    rateLimited: false,
  };
}

/** Delete one Google Calendar event. Throws if the API rejects it. */
export async function deleteEvent(id: string): Promise<void> {
  await calendarApi(`/${encodeURIComponent(id)}?sendUpdates=none`, {
    method: "DELETE",
  });
}

/**
 * Every event on the shared calendar, recurring series as one item each (not
 * expanded into instances — deleting an instance id would only cancel that
 * occurrence). Used by the maintenance scripts.
 */
export async function listAllEvents(): Promise<GoogleEvent[]> {
  const events: GoogleEvent[] = [];
  let pageToken: string | undefined;
  do {
    const params = new URLSearchParams({ maxResults: "2500" });
    if (pageToken) params.set("pageToken", pageToken);
    const page = await calendarApi<{
      items?: GoogleEvent[];
      nextPageToken?: string;
    }>(`?${params}`);
    events.push(...(page.items ?? []));
    pageToken = page.nextPageToken;
  } while (pageToken);
  return events;
}

/** Replace an event's legacy JSON description with a clean tag. Migration only. */
export async function rewriteEventTag(
  googleEventId: string,
  personId: string,
  description = "",
): Promise<void> {
  await calendarApi(`/${encodeURIComponent(googleEventId)}?sendUpdates=none`, {
    method: "PATCH",
    body: JSON.stringify({
      description,
      extendedProperties: { private: { personId } },
    }),
  });
}
