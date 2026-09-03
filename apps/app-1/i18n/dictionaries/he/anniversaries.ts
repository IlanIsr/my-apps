import type { AnniversariesTexts } from "@/app/components/anniversary/AnniversaryList";

export const anniversaries = {
  listPage: {
    title: "ימי הולדת עבריים",
    subtitle: "ימי הולדת ואזכרות בלוח העברי, משותפים למשפחה",
  },
  add: "הוספת יום הולדת",
  search: "חיפוש…",
  joined: "ברשימה שלי",
  empty: {
    hint: "הוסיפו מישהו — היומן המשפחתי מקבל אירועים לשנים הבאות, ואתם מוזמנים אליהם.",
    noResults: "אין תוצאות לחיפוש.",
  },
  card: {
    nextEvent: "הבא",
    events: (n: number) => `${n} אירועים`,
    members: (n: number) => `${n} ${n === 1 ? "אדם" : "אנשים"}`,
  },
} as const satisfies AnniversariesTexts;
