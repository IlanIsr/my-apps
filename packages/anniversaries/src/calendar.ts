/**
 * Google Calendar I/O against the shared bot calendar
 * (`anniversaries.calendar@gmail.com`). The calendar is a **projection** of
 * Firestore: `syncPersonEvents` reconciles a person's events to match what the
 * store says they should be.
 *
 * Authenticates AS the bot account via `google-auth-library` + a stored refresh
 * token; talks to the Calendar REST API with `fetch`.
 */

import { OAuth2Client } from "google-auth-library";

import { getTsetHakohavimWithFallback } from "@repo/hebcal";

const TIMEZONE = "Asia/Jerusalem";
const EVENT_DURATION_MIN = 15;
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

let cachedClient: OAuth2Client | null = null;

function botClient(): OAuth2Client {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
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

async function calendarApi<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${eventsUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${await botToken()}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!response.ok) {
    throw new Error(
      `Google Calendar API ${response.status}: ${await response.text()}`,
    );
  }
  return response.status === 204
    ? (undefined as T)
    : ((await response.json()) as T);
}

/** Whether the shared bot calendar is configured and reachable. */
export async function isCalendarReachable(): Promise<boolean> {
  try {
    const response = await fetch(`${eventsUrl}?maxResults=1`, {
      headers: { Authorization: `Bearer ${await botToken()}` },
    });
    return response.ok;
  } catch {
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

function buildEventBody(fields: {
  summary?: string;
  description?: string;
  date: string;
  time: string;
  attendees: AttendeeInput[];
  personId?: string;
}): Record<string, unknown> {
  const [hour = 0, minute = 0] = fields.time.split(":").map(Number);
  const endTotal = minute + EVENT_DURATION_MIN;
  const endTime = `${String(hour + Math.floor(endTotal / 60)).padStart(
    2,
    "0",
  )}:${String(endTotal % 60).padStart(2, "0")}`;

  const body: Record<string, unknown> = {
    start: { dateTime: `${fields.date}T${fields.time}:00`, timeZone: TIMEZONE },
    end: { dateTime: `${fields.date}T${endTime}:00`, timeZone: TIMEZONE },
    attendees: fields.attendees.map((a) =>
      a.responseStatus
        ? { email: a.email, optional: true, responseStatus: a.responseStatus }
        : { email: a.email, optional: true },
    ),
    guestsCanModify: false,
    guestsCanInviteOthers: false,
    guestsCanSeeOtherGuests: false,
    colorId: EVENT_COLOR_ID,
  };
  if (fields.summary !== undefined) body.summary = fields.summary;
  if (fields.description !== undefined) body.description = fields.description;
  if (fields.personId) {
    body.extendedProperties = { private: { personId: fields.personId } };
  }
  return body;
}

export type DesiredEvent = {
  year: number;
  /** Gregorian eve date, ISO `YYYY-MM-DD`. */
  date: string;
  /** `HH:MM`, or `""` to compute tzeit hakochavim. */
  time: string;
  /** Existing Google event id, or `""` to create one. */
  googleEventId: string;
};

export type SyncedEvent = {
  year: number;
  date: string;
  time: string;
  googleEventId: string;
  htmlLink: string;
};

export type SyncInput = {
  personId: string;
  /** Pre-translated event title. Omit to leave existing titles untouched. */
  summary?: string;
  /** Title for brand-new events when `summary` is omitted. */
  summaryFallback: string;
  /** Event description. Omit to leave it untouched. */
  description?: string;
  /** Family member emails (any case). */
  members: string[];
  /** The events that should exist, after applying manual overrides. */
  events: DesiredEvent[];
};

export type SyncResult = {
  events: SyncedEvent[];
  /** Emails that declined on the shared calendar — treat as "left". */
  declined: string[];
};

/** Reconcile a person's Google Calendar events to match `input`. */
export async function syncPersonEvents(input: SyncInput): Promise<SyncResult> {
  // 1. Fetch the events we think already exist.
  const existing = new Map<string, GoogleEvent>();
  await Promise.all(
    input.events
      .filter((e) => e.googleEventId)
      .map(async (e) => {
        try {
          existing.set(
            e.googleEventId,
            await calendarApi<GoogleEvent>(
              `/${encodeURIComponent(e.googleEventId)}`,
            ),
          );
        } catch {
          // deleted on the calendar — it'll be recreated below
        }
      }),
  );

  // 2. Anyone who declined on any existing event has left.
  const declined = new Set<string>();
  for (const ev of existing.values()) {
    for (const a of ev.attendees ?? []) {
      if (a.responseStatus === "declined" && a.email) {
        declined.add(a.email.toLowerCase());
      }
    }
  }
  const memberEmails = [
    ...new Set(input.members.map((m) => m.toLowerCase())),
  ].filter((m) => !declined.has(m));

  // 3. Reconcile each desired event.
  const events = await Promise.all(
    input.events.map(async (want): Promise<SyncedEvent> => {
      const time = want.time || (await getTsetHakohavimWithFallback(want.date));
      const found = want.googleEventId
        ? existing.get(want.googleEventId)
        : undefined;

      const priorStatus = new Map<string, string>();
      for (const a of found?.attendees ?? []) {
        if (a.email && a.responseStatus) {
          priorStatus.set(a.email.toLowerCase(), a.responseStatus);
        }
      }
      const attendees: AttendeeInput[] = memberEmails.map((email) => {
        const responseStatus = priorStatus.get(email);
        return responseStatus ? { email, responseStatus } : { email };
      });

      if (found) {
        const patched = await calendarApi<GoogleEvent>(
          `/${encodeURIComponent(found.id)}?sendUpdates=none`,
          {
            method: "PATCH",
            body: JSON.stringify(
              buildEventBody({
                summary: input.summary,
                description: input.description,
                date: want.date,
                time,
                attendees,
              }),
            ),
          },
        );
        return {
          year: want.year,
          date: want.date,
          time,
          googleEventId: found.id,
          htmlLink: patched.htmlLink ?? found.htmlLink ?? "",
        };
      }

      const created = await calendarApi<GoogleEvent>("?sendUpdates=none", {
        method: "POST",
        body: JSON.stringify(
          buildEventBody({
            summary: input.summary ?? input.summaryFallback,
            description: input.description ?? "",
            date: want.date,
            time,
            attendees,
            personId: input.personId,
          }),
        ),
      });
      return {
        year: want.year,
        date: want.date,
        time,
        googleEventId: created.id,
        htmlLink: created.htmlLink ?? "",
      };
    }),
  );

  return { events, declined: [...declined] };
}

/** Delete one Google Calendar event. Throws if the API rejects it. */
export async function deleteEvent(id: string): Promise<void> {
  await calendarApi(`/${encodeURIComponent(id)}?sendUpdates=none`, {
    method: "DELETE",
  });
}

/** Delete the given Google Calendar events; ignores ones already gone. */
export async function deletePersonEvents(ids: string[]): Promise<void> {
  await Promise.all(
    ids.filter(Boolean).map(async (id) => {
      try {
        await deleteEvent(id);
      } catch {
        // already deleted
      }
    }),
  );
}

/** Patch a single event's date/time/title (a manual per-event edit). */
export async function patchEvent(input: {
  googleEventId: string;
  date: string;
  time: string;
  summary?: string;
  description?: string;
}): Promise<{ htmlLink: string }> {
  const event = await calendarApi<GoogleEvent>(
    `/${encodeURIComponent(input.googleEventId)}`,
  );
  const attendees: AttendeeInput[] = (event.attendees ?? [])
    .filter((a): a is GoogleAttendee & { email: string } => Boolean(a.email))
    .map((a) =>
      a.responseStatus
        ? { email: a.email, responseStatus: a.responseStatus }
        : { email: a.email },
    );
  const patched = await calendarApi<GoogleEvent>(
    `/${encodeURIComponent(input.googleEventId)}?sendUpdates=none`,
    {
      method: "PATCH",
      body: JSON.stringify(
        buildEventBody({
          summary: input.summary,
          description: input.description,
          date: input.date,
          time: input.time,
          attendees,
        }),
      ),
    },
  );
  return { htmlLink: patched.htmlLink ?? event.htmlLink ?? "" };
}

/** Every event on the shared calendar. Used only by the migration script. */
export async function listAllEvents(): Promise<GoogleEvent[]> {
  const events: GoogleEvent[] = [];
  let pageToken: string | undefined;
  do {
    const params = new URLSearchParams({
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: "2500",
    });
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
  await calendarApi(
    `/${encodeURIComponent(googleEventId)}?sendUpdates=none`,
    {
      method: "PATCH",
      body: JSON.stringify({
        description,
        extendedProperties: { private: { personId } },
      }),
    },
  );
}
