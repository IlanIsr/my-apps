import "server-only";

import { OAuth2Client } from "google-auth-library";

import {
  calculateNextDates,
  getTsetHakohavimWithFallback,
  parseHebrewDate,
} from "@repo/hebcal";

import {
  anniversaryKey,
  decodeAnniversaryDescription,
  encodeAnniversaryDescription,
  type Anniversary,
  type AnniversaryEvent,
} from "@/lib/anniversary";

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
  return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
}

/** Whether the shared bot calendar is configured and reachable. */
export async function isCalendarConfigured(): Promise<boolean> {
  try {
    const response = await fetch(`${eventsUrl}?maxResults=1`, {
      headers: { Authorization: `Bearer ${await botToken()}` },
    });
    return response.ok;
  } catch {
    return false;
  }
}

type GoogleAttendee = { email?: string; optional?: boolean };
type GoogleEvent = {
  id: string;
  summary?: string;
  description?: string;
  htmlLink?: string;
  start?: { dateTime?: string; date?: string };
  attendees?: GoogleAttendee[];
};

function attendeeEmails(event: GoogleEvent): string[] {
  return (event.attendees ?? [])
    .map((a) => a.email?.toLowerCase().trim())
    .filter((email): email is string => Boolean(email));
}

function buildEventBody(fields: {
  summary: string;
  description: string;
  date: string;
  time: string;
  attendees: string[];
}) {
  const [hour = 0, minute = 0] = fields.time.split(":").map(Number);
  const endTotal = minute + EVENT_DURATION_MIN;
  const endTime = `${String(hour + Math.floor(endTotal / 60)).padStart(2, "0")}:${String(endTotal % 60).padStart(2, "0")}`;

  return {
    summary: fields.summary,
    description: fields.description,
    start: { dateTime: `${fields.date}T${fields.time}:00`, timeZone: TIMEZONE },
    end: { dateTime: `${fields.date}T${endTime}:00`, timeZone: TIMEZONE },
    attendees: fields.attendees.map((email) => ({ email, optional: true })),
    guestsCanModify: false,
    guestsCanInviteOthers: false,
    guestsCanSeeOtherGuests: false,
    colorId: EVENT_COLOR_ID,
  };
}

function toAnniversaryEvent(event: GoogleEvent): AnniversaryEvent {
  const start = event.start?.dateTime ?? "";
  return {
    id: event.id,
    date: start.slice(0, 10) || event.start?.date || "",
    summary: event.summary ?? "",
    startDateTime: start,
    htmlLink: event.htmlLink ?? "",
    time: start.slice(11, 16) || undefined,
  };
}

async function listAllEvents(): Promise<GoogleEvent[]> {
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

type Grouped = {
  name: string;
  hebDateLabel: string;
  hebDate: { day: number; month: string };
  members: Set<string>;
  events: GoogleEvent[];
};

async function groupAnniversaries(): Promise<Map<string, Grouped>> {
  const byKey = new Map<string, Grouped>();

  for (const event of await listAllEvents()) {
    const tag = decodeAnniversaryDescription(event.description);
    if (!tag) continue;
    const hebDate = parseHebrewDate(tag.hebDateLabel);
    if (!hebDate) continue;

    const key = anniversaryKey(tag.name, hebDate.day, hebDate.month);
    const existing = byKey.get(key);
    if (existing) {
      existing.events.push(event);
      for (const email of attendeeEmails(event)) existing.members.add(email);
    } else {
      byKey.set(key, {
        name: tag.name,
        hebDateLabel: tag.hebDateLabel,
        hebDate,
        members: new Set(attendeeEmails(event)),
        events: [event],
      });
    }
  }

  return byKey;
}

function toAnniversary(
  key: string,
  group: Grouped,
  userEmail: string,
): Anniversary {
  const events = group.events
    .map(toAnniversaryEvent)
    .sort((a, b) => a.date.localeCompare(b.date));
  return {
    id: key,
    name: group.name,
    hebDate: group.hebDate,
    hebDateLabel: group.hebDateLabel,
    members: [...group.members].sort(),
    joined: group.members.has(userEmail.toLowerCase()),
    events,
  };
}

/** Every anniversary on the shared calendar, with a `joined` flag for the user. */
export async function listAnniversaries(
  userEmail: string,
): Promise<Anniversary[]> {
  const grouped = await groupAnniversaries();
  const list = [...grouped.entries()].map(([key, group]) =>
    toAnniversary(key, group, userEmail),
  );
  list.sort((a, b) =>
    (a.events[0]?.date ?? "").localeCompare(b.events[0]?.date ?? ""),
  );
  return list;
}

export async function getAnniversary(
  id: string,
  userEmail: string,
): Promise<Anniversary | null> {
  const grouped = await groupAnniversaries();
  const group = grouped.get(id);
  return group ? toAnniversary(id, group, userEmail) : null;
}

export type AddAnniversaryInput = {
  name: string;
  hebDay: number;
  hebMonth: string;
  years: number;
  /** Extra people to add to the family list alongside the current user. */
  sharedEmails: string[];
  /** Pre-translated event title. */
  summary: string;
};

/**
 * Create the shared events for an anniversary, or — if it already exists — add
 * the current user (and any `sharedEmails`) to its events and top up missing
 * future years.
 */
export async function addAnniversary(
  input: AddAnniversaryInput,
  userEmail: string,
): Promise<{ created: number; joined: boolean }> {
  const email = userEmail.toLowerCase();
  const hebDateLabel = `${input.hebDay} ${input.hebMonth}`;
  const description = encodeAnniversaryDescription(input.name, hebDateLabel);
  const key = anniversaryKey(input.name, input.hebDay, input.hebMonth);

  const grouped = await groupAnniversaries();
  const existing = grouped.get(key);

  const wantedDates = calculateNextDates(
    input.hebDay,
    input.hebMonth,
    input.years,
  );

  if (existing) {
    // Add the user (+ shared) to every existing event.
    const toAdd = [email, ...input.sharedEmails.map((e) => e.toLowerCase())];
    for (const event of existing.events) {
      const current = attendeeEmails(event);
      const merged = [...new Set([...current, ...toAdd])];
      if (merged.length !== current.length) {
        await calendarApi(`/${encodeURIComponent(event.id)}?sendUpdates=none`, {
          method: "PATCH",
          body: JSON.stringify({
            attendees: merged.map((e) => ({ email: e, optional: true })),
          }),
        });
      }
    }

    // Create events for any wanted future date that doesn't exist yet.
    const covered = new Set(
      existing.events.map((e) => toAnniversaryEvent(e).date),
    );
    const members = [...new Set([...existing.members, ...toAdd])];
    let created = 0;
    for (const date of wantedDates.filter((d) => !covered.has(d))) {
      await createEvent({ date, summary: input.summary, description, members });
      created++;
    }
    return { created, joined: true };
  }

  // Brand new anniversary.
  const members = [
    ...new Set([email, ...input.sharedEmails.map((e) => e.toLowerCase())]),
  ];
  let created = 0;
  for (const date of wantedDates) {
    await createEvent({ date, summary: input.summary, description, members });
    created++;
  }
  return { created, joined: true };
}

async function createEvent(fields: {
  date: string;
  summary: string;
  description: string;
  members: string[];
}): Promise<void> {
  const time = await getTsetHakohavimWithFallback(fields.date);
  await calendarApi("?sendUpdates=none", {
    method: "POST",
    body: JSON.stringify(
      buildEventBody({
        summary: fields.summary,
        description: fields.description,
        date: fields.date,
        time,
        attendees: fields.members,
      }),
    ),
  });
}

/** Remove the user from an anniversary's events; delete an event if nobody's left. */
export async function leaveAnniversary(
  id: string,
  userEmail: string,
): Promise<{ removed: number; deleted: number }> {
  const email = userEmail.toLowerCase();
  const grouped = await groupAnniversaries();
  const group = grouped.get(id);
  if (!group) return { removed: 0, deleted: 0 };

  let removed = 0;
  let deleted = 0;
  for (const event of group.events) {
    const remaining = attendeeEmails(event).filter((e) => e !== email);
    if (remaining.length === attendeeEmails(event).length) continue;

    if (remaining.length === 0) {
      await calendarApi(`/${encodeURIComponent(event.id)}?sendUpdates=none`, {
        method: "DELETE",
      });
      deleted++;
    } else {
      await calendarApi(`/${encodeURIComponent(event.id)}?sendUpdates=none`, {
        method: "PATCH",
        body: JSON.stringify({
          attendees: remaining.map((e) => ({ email: e, optional: true })),
        }),
      });
      removed++;
    }
  }
  return { removed, deleted };
}

export async function updateEvent(input: {
  eventId: string;
  name: string;
  hebDateLabel: string;
  date: string;
  time?: string;
  summary: string;
}): Promise<void> {
  const event = await calendarApi<GoogleEvent>(
    `/${encodeURIComponent(input.eventId)}`,
  );
  const time = input.time || (await getTsetHakohavimWithFallback(input.date));
  const body = buildEventBody({
    summary: input.summary,
    description: encodeAnniversaryDescription(input.name, input.hebDateLabel),
    date: input.date,
    time,
    attendees: attendeeEmails(event),
  });
  await calendarApi(`/${encodeURIComponent(input.eventId)}?sendUpdates=none`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
