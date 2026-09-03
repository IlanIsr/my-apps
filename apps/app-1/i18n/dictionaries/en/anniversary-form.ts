import type { AnniversaryFormTexts } from "@/app/components/anniversary/AnniversaryForm";

const NOT_CONFIGURED =
  "The shared anniversaries calendar isn’t set up yet.";

export const anniversaryForm = {
  name: "Name",
  namePlaceholder: "Ilan Israel Bellaiche",
  hebDate: "Hebrew date",
  day: "Day",
  month: "Month",
  year: "Year",
  years: "Years ahead",
  sharedEmails: "Share with (emails, comma-separated)",
  sharedEmailsPlaceholder: "someone@example.com, other@example.com",
  sharedEmailsHelp:
    "They’re added as optional attendees, invisible to each other.",
  submit: "Create events",
  submitting: "Creating…",
  toggle: {
    hebrew: "Hebrew",
    gregorian: "Gregorian",
    aria: "Toggle input calendar",
  },
  nameRequired: "Name is required.",
  emailInvalid: (email: string) => `Not a valid email: ${email}`,
  notConfigured: NOT_CONFIGURED,
  noSuchDate: "That Hebrew date doesn’t occur (e.g. the 30th of a 29-day month).",
  error: (message: string) => `Something went wrong: ${message}`,
  months: {
    Tishrei: "Tishrei",
    Cheshvan: "Cheshvan",
    Kislev: "Kislev",
    Tevet: "Tevet",
    Shvat: "Shvat",
    Adar: "Adar",
    Adar1: "Adar I",
    Adar2: "Adar II",
    Nisan: "Nisan",
    Iyyar: "Iyar",
    Sivan: "Sivan",
    Tamuz: "Tamuz",
    Av: "Av",
    Elul: "Elul",
  },
} as const satisfies AnniversaryFormTexts;
