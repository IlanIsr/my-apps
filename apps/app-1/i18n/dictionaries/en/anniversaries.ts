import type { AnniversariesTexts } from "@/app/components/anniversary/AnniversaryList";

export const anniversaries = {
  listPage: {
    title: "Hebrew Anniversaries",
    subtitle:
      "Birthdays and yahrzeits on the Hebrew calendar, in your Google Calendar",
  },
  add: "Add an anniversary",
  search: "Search…",
  empty: {
    hint: "Add someone and their next years of events are created in Google Calendar.",
    noResults: "Nothing matches your search.",
  },
  card: {
    nextEvent: "Next",
    events: (n: number) => `${n} event${n === 1 ? "" : "s"}`,
    persons: (n: number) => `${n} ${n === 1 ? "person" : "people"}`,
  },
} as const satisfies AnniversariesTexts;
