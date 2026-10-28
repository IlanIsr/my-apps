/**
 * Who may use the calendar feed (profile card + `feedTokenAction`) while it's
 * being tried out in production — Clerk user ids. Empty this gate (return
 * `true`) to open it to everyone.
 */
const CALENDAR_FEED_USER_IDS: readonly string[] = [
  "user_3LKidNB4nrxEF0bI37zrKrgMP9G",
];

export function canUseCalendarFeed(userId: string | null): boolean {
  return userId !== null && CALENDAR_FEED_USER_IDS.includes(userId);
}
