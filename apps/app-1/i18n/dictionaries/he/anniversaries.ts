import type { AnniversariesTexts } from "@/app/components/anniversary/AnniversaryList";

/** Hebrew UI strings — shape: {@link AnniversariesTexts}. */
export const anniversaries = {
  listPage: {
    title: "ימי שנה עבריים",
    subtitle: (count: number, admin: boolean) =>
      admin ? `${count} אנשים` : `${count} ברשימה שלי`,
  },
  add: "הוספת יום שנה",
  shareList: "שיתוף הרשימה שלי",
  shareModal: {
    title: "שיתוף הרשימה שלי",
    intro:
      "הוסיפו אדם לכל יום שנה שתבחרו. הוא יוזמן ליומן המשותף של כל אחד מהם.",
    shareWith: "שיתוף עם",
    placeholder: "someone@example.com",
    notify: "לשלוח לו הזמנה ליומן",
    selectAll: "בחירת הכול",
    clearAll: "ניקוי",
    share: "שיתוף",
    sharing: "משתף…",
    cancel: "ביטול",
    emailInvalid: "יש להזין כתובת אימייל תקינה.",
    nothingSelected: "בחרו לפחות יום שנה אחד.",
    rateLimited: "יומן Google הגביל אותנו באמצע.",
    result: (added: number, already: number, failed: number) =>
      [
        added > 0 && `נוסף ל-${added}`,
        already > 0 && `${already} כבר משותפים`,
        failed > 0 && `${failed} נכשלו`,
      ]
        .filter(Boolean)
        .join(" · ") || "אין מה לעשות.",
    error: (message: string) => `משהו השתבש: ${message}`,
  },
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
