import type { AdminTexts } from "@/app/admin/AdminView";

/** Hebrew UI strings — shape: {@link AdminTexts}. */
export const admin = {
  eyebrow: "חשבון משותף",
  title: "ניהול",
  subtitle: "הגדרות היומן המשפחתי המשותף.",
  empty: "עדיין אין כאן כלום.",
  sync: {
    title: "העתקת נתוני פרודקשן",
    body: "החלפת כל ימי ההולדת בסביבה הזו בעותק מדויק של הפרודקשן. אירועי היומן לא מושפעים.",
    button: "העתקה מפרודקשן",
    running: "מעתיק…",
    confirm:
      "פעולה זו מחליפה את כל ימי ההולדת בסביבה הזו בנתוני הפרודקשן. להמשיך?",
    done: (written: number, deleted: number) =>
      `הושלם — ${written} הועתקו, ${deleted} הוסרו.`,
    error: (message: string) => `הסנכרון נכשל: ${message}`,
  },
  resync: {
    title: "עדכון כל האירועים",
    body: "כותב מחדש את אירוע ה-Google של כל תאריך בפורמט הנוכחי: מצאת הכוכבים בערב ועד השקיעה למחרת. בלי מיילים לחברים, הכותרות לא משתנות.",
    button: "עדכון כל האירועים",
    resume: "המשך",
    confirm: "לכתוב מחדש את האירוע של כל תאריך ביומן Google? לא יישלח מייל.",
    running: (done: number, total: number) => `מעדכן… ${done}/${total}`,
    rateLimited: (done: number, total: number) =>
      `יומן Google מגביל כתיבות — נעצר ב-${done}/${total}. המתינו דקה ולחצו „המשך”.`,
    done: (total: number, failed: number) =>
      `הסתיים — ${total - failed}/${total} עודכנו` +
      (failed ? `, ${failed} נכשלו (ראו לוגים).` : "."),
    error: (message: string) => `נכשל: ${message}`,
  },
} as const satisfies AdminTexts;
