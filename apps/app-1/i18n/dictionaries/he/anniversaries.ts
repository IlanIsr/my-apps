import type { AnniversariesTexts } from "@/app/components/anniversary/AnniversaryList";

export const anniversaries = {
  listPage: {
    title: "ימי הולדת עבריים",
    subtitle: "ימי הולדת ואזכרות בלוח העברי, ביומן Google שלך",
  },
  add: "הוספת יום הולדת",
  search: "חיפוש…",
  empty: {
    hint: "הוסיפו מישהו — השנים הבאות של האירועים ייווצרו ביומן Google.",
    noResults: "אין תוצאות לחיפוש.",
  },
  card: {
    nextEvent: "הבא",
    events: (n: number) => `${n} אירועים`,
    persons: (n: number) => `${n} ${n === 1 ? "אדם" : "אנשים"}`,
  },
} as const satisfies AnniversariesTexts;
