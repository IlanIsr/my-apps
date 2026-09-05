import type { AdminTexts } from "@/app/admin/AdminView";

export const admin = {
  eyebrow: "חשבון משותף",
  title: "ניהול",
  subtitle: "הגדרות היומן המשפחתי המשותף.",
  empty: "עדיין אין כאן כלום.",
  sync: {
    title: "העתקת נתוני פרודקשן",
    body: "החלפת כל ימי השנה בסביבה הזו בעותק מדויק של הפרודקשן. אירועי היומן לא מושפעים.",
    button: "העתקה מפרודקשן",
    running: "מעתיק…",
    confirm: "פעולה זו מחליפה את כל ימי השנה בסביבה הזו בנתוני הפרודקשן. להמשיך?",
    done: (written: number, deleted: number) =>
      `הושלם — ${written} הועתקו, ${deleted} הוסרו.`,
    error: (message: string) => `הסנכרון נכשל: ${message}`,
  },
} as const satisfies AdminTexts;
