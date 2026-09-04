import type { AnniversariesTexts } from "@/app/components/anniversary/AnniversaryList";

function ordinal(n: number): string {
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

export const anniversaries = {
  listPage: {
    title: "Hebrew Anniversaries",
    subtitle: (people: number, mine: number) =>
      `${people} ${people === 1 ? "person" : "people"} · ${mine} on your list`,
  },
  add: "Add anniversary",
  search: "Search by name or Hebrew date",
  joined: "On my list",
  eyebrow: { birthday: "Birthday", yahrzeit: "Yahrzeit" },
  empty: {
    title: "No anniversaries yet",
    body: "Add a birthday or a yahrzeit and it will appear here with its Hebrew date and the next years of occurrences.",
    cta: "Add the first one",
    noResults: "Nothing matches your search.",
  },
  card: {
    nextEvent: "Next",
    events: (n: number) => `${n} event${n === 1 ? "" : "s"}`,
    members: (n: number) => `${n} member${n === 1 ? "" : "s"}`,
    age: (n: number) => `turns ${n}`,
    since: (n: number) => `${ordinal(n)} year`,
  },
} as const satisfies AnniversariesTexts;
