import type { OnboardingTexts } from "@/app/components/OnboardingModal";

/** English UI strings — shape: {@link OnboardingTexts}. */
export const onboarding = {
  title: "Welcome!",
  intro: "A few settings are waiting in your profile:",
  items: [
    {
      title: "Time zone",
      text: "your events follow your time zone and start at nightfall there (Jerusalem by default).",
    },
    {
      title: "Minhag",
      text: "Sephardi or Ashkenazi: the wording, and which Adar is the default in leap years.",
    },
    {
      calendarFeed: true,
      title: "Apple / Outlook calendar",
      text: "a link to subscribe from any calendar app.",
    },
    {
      title: "CSV import",
      text: "add your anniversaries from a Hebcal export.",
    },
  ],
  openProfile: "Open my profile",
  later: "Later",
} as const satisfies OnboardingTexts;
