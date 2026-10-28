/**
 * `GET /feed/<token>.ics` — the user's private iCalendar feed (Apple Calendar,
 * Outlook, Google "From URL" subscribe to it). Public in `proxy.ts`: a calendar
 * app has no Clerk session, so the unguessable token is the credential, and
 * only that token's owner's anniversaries are in it. `?lang=` picks the event
 * titles' language (set when the link is generated).
 */

import { buildCalendarFeed, getCalendarFeed } from "@repo/anniversaries";

import { getDictionary, isLocale } from "@/i18n";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const token = (await params).token.replace(/\.ics$/, "");
  const url = new URL(request.url);

  let feed: Awaited<ReturnType<typeof getCalendarFeed>>;
  try {
    feed = await getCalendarFeed(token);
  } catch (error) {
    console.error("[feed] loading calendar feed failed:", error);
    return new Response("Unavailable", { status: 503 });
  }
  if (!feed) return new Response("Not found", { status: 404 });

  const lang = url.searchParams.get("lang");
  const t = getDictionary(isLocale(lang) ? lang : "en", feed.minhag);
  const body = buildCalendarFeed({
    calendarName: t.profile.calendarFeed.calendarName,
    persons: feed.persons,
    summary: (type, name) => t.eventSummary[type](name),
    timezone: feed.timezone,
    personUrl: (id) => `${url.origin}/anniversaries/${encodeURIComponent(id)}`,
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="anniversaries.ics"',
      "Cache-Control": "private, max-age=300",
    },
  });
}
