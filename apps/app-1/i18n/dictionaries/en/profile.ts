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
      "A Hebcal export (Yahrzeit + Anniversary, CSV format). Dates dd/mm/yyyy or mm/dd/yyyy. Each person is added to your list; if they already exist, you join them.",
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
} as const satisfies ProfileTexts;
