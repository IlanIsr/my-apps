import type { LandingTexts } from "@/app/LandingView";

/** English UI strings — shape: {@link LandingTexts}. */
export const landing = {
  eyebrow: "Anniversaries",
  title: "Hebrew birthdays and yahrzeits, on your calendar",
  tagline:
    "Anniversaries turns a Hebrew-calendar date into the next years of Gregorian dates and keeps them on a shared Google Calendar, so family birthdays and yahrzeits never slip by.",
  whatItDoes: {
    heading: "What it does",
    body: "Add a person and their Hebrew date once. Anniversaries works out when that date falls each year, then creates and maintains calendar events for it — on the eve and at nightfall — on a shared family calendar.",
  },
  whyCalendar: {
    heading: "Why it uses Google Calendar",
    body: "The point is a real reminder in the calendar you already use. To do that, the app needs permission to create and update the anniversary events on the shared calendar, and to add the family members you choose as guests so the dates show up for them too.",
  },
  whoFor: {
    heading: "Who it is for",
    body: "Families who mark Hebrew-calendar dates — Jewish birthdays and yahrzeits (memorial anniversaries) — and want them handled once instead of recalculated every year.",
  },
  howToUse: {
    heading: "How to use it",
    body: "Sign in with your Google account, add your family's dates, and choose who to share each one with. The app is trilingual (English, Hebrew, French).",
  },
  signIn: "Sign in with Google",
  privacyLink: "Privacy policy",
} as const satisfies LandingTexts;
