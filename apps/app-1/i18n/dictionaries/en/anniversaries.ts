import type { AnniversariesTexts } from "@/app/components/anniversary/AnniversaryList";

export const anniversaries = {
  listPage: {
    title: "Hebrew Anniversaries",
    subtitle:
      "Birthdays and yahrzeits on the Hebrew calendar, shared with the family",
  },
  add: "Add an anniversary",
  search: "Search…",
  joined: "on your list",
  empty: {
    hint: "Add someone — the family calendar gets events for the next years, and you’re invited to them.",
    noResults: "Nothing matches your search.",
  },
  card: {
    nextEvent: "Next",
    events: (n: number) => `${n} event${n === 1 ? "" : "s"}`,
    members: (n: number) => `${n} ${n === 1 ? "person" : "people"}`,
  },
} as const satisfies AnniversariesTexts;
