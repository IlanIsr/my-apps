import type { AnniversaryMessages } from "../en/anniversary";

export const anniversary: AnniversaryMessages = {
  nav: "ימי הולדת",
  listPage: {
    title: "ימי הולדת עבריים",
    subtitle: "ימי הולדת ואזכרות בלוח העברי, ביומן Google שלך",
  },
  add: "הוספת יום הולדת",
  search: "חיפוש…",
  results: {
    count: (n) => `${n} ${n === 1 ? "אדם" : "אנשים"}`,
    search: (shown, total, query) => `${shown} מתוך ${total} עבור ״${query}״`,
  },
  empty: {
    none: "אין עדיין אירועי יום הולדת ביומן שלך.",
    noResults: "אין תוצאות לחיפוש.",
    hint: "הוסיפו מישהו — השנים הבאות של האירועים ייווצרו ביומן Google.",
  },
  card: {
    hebDate: "תאריך עברי",
    sharedWith: "משותף עם",
    persons: (n) => `${n} ${n === 1 ? "אדם" : "אנשים"}`,
    nextEvent: "הבא",
    events: (n) => `${n} אירועים`,
  },
  detail: {
    back: "← כל ימי ההולדת",
    hebDate: "תאריך עברי",
    sharedWith: "משותף עם",
    upcoming: "אירועים קרובים",
    deleteAll: "מחיקת כל האירועים",
  },
  new: {
    title: "יום הולדת חדש",
    subtitle: "השנים הבאות של האירועים יתווספו ליומן Google שלך.",
  },
  form: {
    name: "שם",
    namePlaceholder: "אילן ישראל בלייש",
    hebDate: "תאריך עברי",
    day: "יום",
    month: "חודש",
    years: "שנים קדימה",
    sharedEmails: "שיתוף עם (אימיילים, מופרדים בפסיקים)",
    sharedEmailsPlaceholder: "someone@example.com, other@example.com",
    sharedEmailsHelp: "הם מתווספים כמוזמנים אופציונליים, בלתי נראים זה לזה.",
    submit: "יצירת אירועים",
    submitting: "יוצר…",
  },
  validation: {
    nameRequired: "יש להזין שם.",
    emailInvalid: (email) => `אימייל לא תקין: ${email}`,
  },
  notFound: {
    title: "יום ההולדת לא נמצא",
    message: "אין אירועי יומן עבור אדם זה.",
  },
  toast: {
    created: (n) => `נוצרו ${n} אירועים.`,
    deleted: (n) => `נמחקו ${n} אירועים.`,
    error: (message) => `משהו השתבש: ${message}`,
  },
};
