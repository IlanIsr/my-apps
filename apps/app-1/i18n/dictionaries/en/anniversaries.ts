import type { AnniversariesTexts } from "@/app/components/anniversary/AnniversaryList";
import { createShareLinkModal } from "./create-share-link-modal";
import { ordinal } from "./ordinal";

/** English UI strings — shape: {@link AnniversariesTexts}. */
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
  shareModal: createShareLinkModal,
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
