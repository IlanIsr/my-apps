import type { OnboardingTexts } from "@/app/components/OnboardingModal";

/** English UI strings — shape: {@link OnboardingTexts}. */
export const onboarding = {
  title: "Welcome!",
  intro: "A few settings are waiting in your profile:",
  items: [
    {
      title: "City",
      text: "your events start at nightfall where you live (Jerusalem by default).",
    },
    {
      title: "Minhag",
      text: "Sephardi or Ashkenazi: the wording, and which Adar is the default in leap years.",
    },
    {
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
