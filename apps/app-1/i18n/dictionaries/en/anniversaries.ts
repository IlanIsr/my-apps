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
    subtitle: (count: number, admin: boolean) =>
      admin
        ? `${count} ${count === 1 ? "person" : "people"}`
        : `${count} on your list`,
  },
  add: "Add anniversary",
  shareList: "Share my list",
  shareModal: {
    title: "Share my list",
    intro:
      "Add someone to every anniversary you pick. They're invited to the shared calendar for each one.",
    shareWith: "Share with",
    placeholder: "someone@example.com",
    notify: "Email them a calendar invite",
    selectAll: "Select all",
    clearAll: "Clear",
    share: "Share",
    sharing: "Sharing…",
    cancel: "Cancel",
    emailInvalid: "Enter a valid email address.",
    nothingSelected: "Pick at least one anniversary.",
    rateLimited: "Google Calendar rate-limited us partway through.",
    result: (added: number, already: number, failed: number) =>
      [
        added > 0 && `Added to ${added}`,
        already > 0 && `${already} already shared`,
        failed > 0 && `${failed} failed`,
      ]
        .filter(Boolean)
        .join(" · ") || "Nothing to do.",
    error: (message: string) => `Something went wrong: ${message}`,
  },
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
