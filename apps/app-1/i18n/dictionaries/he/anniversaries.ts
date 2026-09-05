import type { AnniversariesTexts } from "@/app/components/anniversary/AnniversaryList";

export const anniversaries = {
  listPage: {
    title: "ימי שנה עבריים",
    subtitle: (count: number, admin: boolean) =>
      admin ? `${count} אנשים` : `${count} ברשימה שלי`,
  },
  add: "הוספת יום שנה",
  search: "חיפוש לפי שם או תאריך עברי",
  joined: "ברשימה שלי",
  eyebrow: { birthday: "יום הולדת", yahrzeit: "אזכרה" },
  empty: {
    title: "אין עדיין ימי שנה",
    body: "הוסיפו יום הולדת או אזכרה, והם יופיעו כאן עם התאריך העברי והשנים הקרובות.",
    cta: "הוספת הראשון",
    noResults: "אין תוצאות לחיפוש.",
  },
  card: {
    nextEvent: "הבא",
    events: (n: number) => `${n} מועדים`,
    members: (n: number) => `${n} חברים`,
    age: (n: number) => `גיל ${n}`,
    since: (n: number) => `שנה ${n}`,
  },
} as const satisfies AnniversariesTexts;
