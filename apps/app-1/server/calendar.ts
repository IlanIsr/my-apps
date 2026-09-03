import "server-only";

import { getGoogleAccessToken } from "@repo/auth/google";
import {
  calculateNextDates,
  getTsetHakohavimWithFallback,
  parseHebrewDate,
} from "@repo/hebcal";

import {
  anniversaryId,
  decodeAnniversaryDescription,
  encodeAnniversaryDescription,
  type Anniversary,
  type AnniversaryEvent,
} from "@/lib/anniversary";

const EVENTS_URL = "https://www.googleapis.com/calendar/v3/calendars/primary/events";
const TIMEZONE = "Asia/Jerusalem";
const EVENT_DURATION_MIN = 15;
const EVENT_COLOR_ID = "5";

export class GoogleCalendarNotConnectedError extends Error {
  constructor() {
    super("google-calendar-not-connected");
    this.name = "GoogleCalendarNotConnectedError";
  }
}

/**
 * Whether the signed-in user has actually granted Google Calendar access
 * (a token can exist without the calendar scope if they signed in before it was
 * configured). Verified with a cheap API call.
 */
export async function isGoogleCalendarConnected(): Promise<boolean> {
  const token = await getGoogleAccessToken();
  if (!token) return false;
  try {
    const response = await fetch(`${EVENTS_URL}?maxResults=1`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.ok;
  } catch {
    return false;
  }
}

type GoogleEvent = {
  id: string;
  summary?: string;
  description?: string;
  htmlLink?: string;
  start?: { dateTime?: string; date?: string };
  attendees?: { email?: string }[];
};

async function accessToken(): Promise<string> {
  const token = await getGoogleAccessToken();
  if (!token) throw new GoogleCalendarNotConnectedError();
  return token;
}

async function calendarApi<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${EVENTS_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${await accessToken()}`,
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

function buildEventBody(fields: {
  summary: string;
  description: string;
  date: string;
  time: string;
  shared: string[];
}) {
  const [hour = 0, minute = 0] = fields.time.split(":").map(Number);
  const endTotal = minute + EVENT_DURATION_MIN;
  const endTime = `${String(hour + Math.floor(endTotal / 60)).padStart(2, "0")}:${String(endTotal % 60).padStart(2, "0")}`;

  return {
    summary: fields.summary,
    description: fields.description,
    start: { dateTime: `${fields.date}T${fields.time}:00`, timeZone: TIMEZONE },
    end: { dateTime: `${fields.date}T${endTime}:00`, timeZone: TIMEZONE },
    attendees: fields.shared.map((email) => ({ email, optional: true })),
    guestsCanModify: false,
    guestsCanInviteOthers: false,
    guestsCanSeeOtherGuests: false,
    colorId: EVENT_COLOR_ID,
  };
}

function toAnniversaryEvent(
  event: GoogleEvent,
  date: string,
  time: string,
  shared: string[],
): AnniversaryEvent {
  return {
    id: event.id,
    date,
    summary: event.summary ?? "",
    startDateTime: event.start?.dateTime ?? `${date}T${time}:00`,
    htmlLink: event.htmlLink ?? "",
    time,
    shared,
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

/** Every anniversary the signed-in user has calendar events for, grouped by person. */
export async function listAnniversaries(): Promise<Anniversary[]> {
  const byPerson = new Map<string, Anniversary>();

  for (const event of await listAllEvents()) {
    const tag = decodeAnniversaryDescription(event.description);
    if (!tag) continue;

    const hebDate = parseHebrewDate(tag.hebDateLabel);
    if (!hebDate) continue;

    const start = event.start?.dateTime ?? "";
    const anniversaryEvent: AnniversaryEvent = {
      id: event.id,
      date: start.slice(0, 10) || event.start?.date || "",
      summary: event.summary ?? "",
      startDateTime: start,
      htmlLink: event.htmlLink ?? "",
      time: start.slice(11, 16) || undefined,
      shared: (event.attendees ?? [])
        .map((a) => a.email?.toLowerCase().trim())
        .filter((email): email is string => Boolean(email)),
    };

    const id = anniversaryId(tag.name);
    const existing = byPerson.get(id);
    if (existing) {
      existing.events.push(anniversaryEvent);
      for (const email of anniversaryEvent.shared) {
        if (!existing.shared.includes(email)) existing.shared.push(email);
      }
    } else {
      byPerson.set(id, {
        id,
        name: tag.name,
        hebDate,
        hebDateLabel: tag.hebDateLabel,
        shared: [...anniversaryEvent.shared],
        events: [anniversaryEvent],
      });
    }
  }

  const anniversaries = [...byPerson.values()];
  for (const anniversary of anniversaries) {
    anniversary.events.sort((a, b) => a.date.localeCompare(b.date));
  }
  anniversaries.sort((a, b) =>
    (a.events[0]?.date ?? "").localeCompare(b.events[0]?.date ?? ""),
  );
  return anniversaries;
}

export async function getAnniversary(id: string): Promise<Anniversary | null> {
  return (await listAnniversaries()).find((a) => a.id === id) ?? null;
}

export type CreateAnniversaryEventsInput = {
  name: string;
  hebDay: number;
  hebMonth: string;
  shared: string[];
  years: number;
  /** Pre-translated event title, e.g. "Anniversary of Ilan". */
  summary: string;
};

/**
 * Create calendar events for the next `years` occurrences of a Hebrew date,
 * skipping any date that already has an event for this person.
 */
export async function createAnniversaryEvents(
  input: CreateAnniversaryEventsInput,
): Promise<AnniversaryEvent[]> {
  const hebDateLabel = `${input.hebDay} ${input.hebMonth}`;
  const description = encodeAnniversaryDescription(input.name, hebDateLabel);

  const existing = await getAnniversary(anniversaryId(input.name));
  const covered = new Set(existing?.events.map((e) => e.date) ?? []);

  const dates = calculateNextDates(
    input.hebDay,
    input.hebMonth,
    input.years,
  ).filter((date) => !covered.has(date));

  const created: AnniversaryEvent[] = [];
  for (const date of dates) {
    const time = await getTsetHakohavimWithFallback(date);
    const event = await calendarApi<GoogleEvent>("", {
      method: "POST",
      body: JSON.stringify(
        buildEventBody({
          summary: input.summary,
          description,
          date,
          time,
          shared: input.shared,
        }),
      ),
    });
    created.push(toAnniversaryEvent(event, date, time, input.shared));
  }
  return created;
}

export async function updateAnniversaryEvent(input: {
  eventId: string;
  name: string;
  hebDateLabel: string;
  date: string;
  time?: string;
  shared: string[];
  summary: string;
}): Promise<AnniversaryEvent> {
  const time = input.time || (await getTsetHakohavimWithFallback(input.date));
  const description = encodeAnniversaryDescription(
    input.name,
    input.hebDateLabel,
  );
  const event = await calendarApi<GoogleEvent>(
    `/${encodeURIComponent(input.eventId)}`,
    {
      method: "PUT",
      body: JSON.stringify(
        buildEventBody({
          summary: input.summary,
          description,
          date: input.date,
          time,
          shared: input.shared,
        }),
      ),
    },
  );
  return toAnniversaryEvent(event, input.date, time, input.shared);
}

export async function deleteEvent(eventId: string): Promise<void> {
  await calendarApi(`/${encodeURIComponent(eventId)}`, { method: "DELETE" });
}

export async function deleteAnniversaryEvents(id: string): Promise<number> {
  const anniversary = await getAnniversary(id);
  if (!anniversary) return 0;

  let deleted = 0;
  for (const event of anniversary.events) {
    try {
      await deleteEvent(event.id);
      deleted++;
    } catch {
      // best effort — keep going
    }
  }
  return deleted;
}
