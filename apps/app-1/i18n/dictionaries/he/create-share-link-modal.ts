import type { CreateShareLinkModalTexts } from "@/app/components/anniversary/CreateShareLinkModal";

/**
 * Hebrew UI strings — shape: {@link CreateShareLinkModalTexts}. משותף בין
 * `anniversaries.ts` ("Share my list") ל-`anniversary-detail.ts` ("Share
 * this one") — אותה מודאל, שתי נקודות כניסה.
 */
export const createShareLinkModal = {
  title: "שיתוף קישור",
  intro:
    "בחרו אילו ימי הולדת לכלול. מי שפותח את הקישור מחליט אילו מהם להצטרף אליהם — לא מבקשים מכם אימייל של אף אחד.",
  selectAll: "בחירת הכול",
  clearAll: "ניקוי",
  generate: "יצירת קישור",
  generating: "יוצר…",
  cancel: "ביטול",
  copy: "העתקה",
  copied: "הועתק!",
  linkIntro: "שתפו את הקישור הזה עם מי שתרצו:",
  expiresIn: "תקף ל-24 שעות. כל אחד יכול לפתוח אותו ולהצטרף עד אז.",
  nothingSelected: "בחרו לפחות יום הולדת אחד.",
  error: (message: string) => `משהו השתבש: ${message}`,
} as const satisfies CreateShareLinkModalTexts;
