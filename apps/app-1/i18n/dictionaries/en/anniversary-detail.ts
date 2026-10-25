import type { AnniversaryDetailTexts } from "@/app/components/anniversary/AnniversaryDetail";
import { createShareLinkModal } from "./create-share-link-modal";
import { hebrewMonths } from "./hebrew-months";
import { minhagField } from "./minhag-field";
import { ordinal } from "./ordinal";

/** English UI strings — shape: {@link AnniversaryDetailTexts}. */
export const anniversaryDetail = {
  back: "All anniversaries",
  eyebrow: { birthday: "Birthday", yahrzeit: "Azkara" },
  hebDate: "Hebrew date",
  family: "Family on this date",
  upcoming: "Upcoming",
  editDetails: "Edit details",
  shareThis: "Share this one",
  viewInCalendar: "Google Calendar ↗",
  nightfall: "nightfall",
  join: "Add to my list",
  joining: "Adding…",
  leave: "Leave this list",
  leaving: "Removing…",
  leaveConfirm: "Remove yourself from this anniversary?",
  rateLimited:
    "Google Calendar is busy right now — wait a moment and try again.",
  age: (n: number) => `turns ${n}`,
  since: (n: number) => `${ordinal(n)} azkara`,
  error: (message: string) => `Something went wrong: ${message}`,
  editPersonForm: {
    name: "Name",
    hebDate: "Hebrew date",
    calendar: "Calendar",
    day: "Day",
    month: "Month",
    year: "Year",
    afterNightfall: "After nightfall",
    hebrewName: "Hebrew name",
    hebYear: "Hebrew year",
    optional: "optional",
    save: "Save changes",
    saving: "Saving…",
    cancel: "Cancel",
    toggle: {
      hebrew: "Hebrew",
      gregorian: "Gregorian",
      aria: "Toggle input calendar",
    },
    nameRequired: "Name is required.",
    noSuchDate:
      "That Hebrew date doesn’t occur (e.g. the 30th of a 29-day month).",
    rateLimited:
      "Google Calendar is busy right now — wait a moment and try again.",
    error: (message: string) => `Something went wrong: ${message}`,
    months: hebrewMonths,
    minhag: minhagField,
  },
  shareModal: createShareLinkModal,
} as const satisfies AnniversaryDetailTexts;
