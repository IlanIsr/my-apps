import type { AnniversaryFormTexts } from "@/app/components/anniversary/AnniversaryForm";

const NOT_CONFIGURED = "לוח ימי ההולדת המשותף עדיין לא מוגדר.";

export const anniversaryForm = {
  name: "שם",
  namePlaceholder: "אילן ישראל בלייש",
  hebDate: "תאריך עברי",
  day: "יום",
  month: "חודש",
  year: "שנה",
  years: "שנים קדימה",
  sharedEmails: "שיתוף עם (אימיילים, מופרדים בפסיקים)",
  sharedEmailsPlaceholder: "someone@example.com, other@example.com",
  sharedEmailsHelp:
    "אתה מתווסף אוטומטית. כל אחד אחר כאן מצטרף כאורח אופציונלי, בלתי נראה לאחרים.",
  submit: "יצירת אירועים",
  submitting: "יוצר…",
  toggle: {
    hebrew: "עברי",
    gregorian: "לועזי",
    aria: "החלפת לוח השנה להזנה",
  },
  nameRequired: "יש להזין שם.",
  emailInvalid: (email: string) => `אימייל לא תקין: ${email}`,
  notConfigured: NOT_CONFIGURED,
  noSuchDate: "תאריך עברי זה אינו קיים (למשל ה-30 בחודש בן 29 יום).",
  rateLimited: "יומן Google עסוק כרגע — המתינו רגע ונסו שוב.",
  error: (message: string) => `משהו השתבש: ${message}`,
  months: {
    Tishrei: "תשרי",
    Cheshvan: "חשוון",
    Kislev: "כסלו",
    Tevet: "טבת",
    Shvat: "שבט",
    Adar: "אדר",
    Adar1: "אדר א׳",
    Adar2: "אדר ב׳",
    Nisan: "ניסן",
    Iyyar: "אייר",
    Sivan: "סיוון",
    Tamuz: "תמוז",
    Av: "אב",
    Elul: "אלול",
  },
} as const satisfies AnniversaryFormTexts;
