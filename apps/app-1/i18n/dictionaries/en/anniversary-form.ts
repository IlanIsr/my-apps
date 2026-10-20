import type { AnniversaryFormTexts } from "@/app/components/anniversary/AnniversaryForm";

import { hebrewMonths } from "./hebrew-months";

const NOT_CONFIGURED = "The shared anniversaries calendar isn’t set up yet.";

/** English UI strings — shape: {@link AnniversaryFormTexts}. */
export const anniversaryForm = {
  name: "Name",
  namePlaceholder: "Ilan Israel Bellaiche",
  type: "What is it?",
  types: { birthday: "Birthday", yahrzeit: "Yahrzeit" },
  hebDate: "Hebrew date",
  calendar: "Calendar",
  day: "Day",
  month: "Month",
  year: "Year",
  afterNightfall: "After nightfall",
  hebYear: "Hebrew year",
  optional: "optional",
  years: "Years ahead",
  submit: "Create anniversary",
  submitting: "Creating…",
  cancel: "Cancel",
  toggle: {
    hebrew: "Hebrew",
    gregorian: "Gregorian",
    aria: "Toggle input calendar",
  },
  nameRequired: "Name is required.",
  notConfigured: NOT_CONFIGURED,
  noSuchDate:
    "That Hebrew date doesn’t occur (e.g. the 30th of a 29-day month).",
  rateLimited:
    "Google Calendar is busy right now — wait a moment and try again.",
  error: (message: string) => `Something went wrong: ${message}`,
  months: hebrewMonths,
} as const satisfies AnniversaryFormTexts;
