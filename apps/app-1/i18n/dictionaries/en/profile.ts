import type { ProfileTexts } from "@/app/profile/ProfileView";
import { hebrewMonths } from "./hebrew-months";

export const profile = {
  title: "Profile",
  intro: "Your preferences for the app.",
  minhag: {
    title: "Minhag",
    sephardi: "Sephardi",
    ashkenazi: "Ashkenazi",
    hint: "Sephardi: “Azkara”, and Adar II by default in a year with two Adars. Ashkenazi: “Yortzeit”, and Adar I by default.",
  },
  saved: "Saved.",
  error: "Couldn't save. Try again.",
  csvImport: {
    title: "Import a CSV",
    intro:
      "Accepted format: Hebcal's CSV export (hebcal.com → Yahrzeit + Anniversary → CSV). Dates dd/mm/yyyy or mm/dd/yyyy. Each person is added to your list; if they already exist, you join them.",
    otherFormat: "Your file comes from somewhere else?",
    contact: "Contact us",
    contactAfter: " and we'll handle it.",
    choose: "Choose a file…",
    nothingFound: "No anniversary recognised in this file.",
    found: (people: number, skipped: number) =>
      `${people} ${people === 1 ? "person" : "people"} found` +
      (skipped ? ` · ${skipped} row${skipped === 1 ? "" : "s"} skipped` : ""),
    type: "Type",
    types: { birthday: "Birthday", yahrzeit: "Azkara" },
    dates: (n: number) => `${n} date${n === 1 ? "" : "s"} in the file`,
    year: (y: number) => `year ${y}`,
    import: (n: number) => `Import (${n})`,
    importing: (done: number, total: number) => `Importing… ${done}/${total}`,
    status: {
      created: "Added",
      joined: "Already there — joined",
      failed: "Failed",
    },
    rateLimited:
      "Google Calendar is busy — wait a minute, then run it again to import the rest.",
    done: (created: number, joined: number, failed: number) =>
      `Done: ${created} added, ${joined} joined` +
      (failed ? `, ${failed} failed` : "") +
      ".",
    months: hebrewMonths,
  },
  calendarFeed: {
    title: "Apple Calendar / Outlook",
    intro:
      "Subscribe to your anniversaries from Calendar (iPhone, Mac), Outlook or any other calendar app. Read-only; your app updates it by itself, sometimes a few hours late. This link is personal — don't share it.",
    show: "Get my link",
    loading: "Loading…",
    subscribe: "Subscribe in Calendar",
    otherApps:
      "Another calendar (Outlook, Google “From URL”…): copy this link.",
    copy: "Copy",
    copied: "Copied",
    renew: "New link",
    renewHint:
      "The old link stops working — you'll need to subscribe again with the new one.",
    error: "Couldn't get the link. Try again.",
    calendarName: "Anniversaries",
  },
} as const satisfies ProfileTexts;
