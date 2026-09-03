import type { AnniversaryFormTexts } from "@/app/components/anniversary/AnniversaryForm";

const NOT_CONNECTED = "גישה ליומן לא אושרה. התנתקו והתחברו מחדש כדי לאשר.";

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
  sharedEmailsHelp: "הם מתווספים כמוזמנים אופציונליים, בלתי נראים זה לזה.",
  submit: "יצירת אירועים",
  submitting: "יוצר…",
  toggle: {
    hebrew: "עברי",
    gregorian: "לועזי",
    aria: "החלפת לוח השנה להזנה",
  },
  nameRequired: "יש להזין שם.",
  emailInvalid: (email: string) => `אימייל לא תקין: ${email}`,
  notConnected: NOT_CONNECTED,
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
