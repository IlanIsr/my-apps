import type { AnniversaryFormTexts } from "@/app/components/anniversary/AnniversaryForm";

import { hebrewMonths } from "./hebrew-months";

const NOT_CONFIGURED = "לוח ימי השנה המשותף עדיין לא מוגדר.";

/** Hebrew UI strings — shape: {@link AnniversaryFormTexts}. */
export const anniversaryForm = {
  name: "שם",
  namePlaceholder: "אילן ישראל בלייש",
  type: "מהו האירוע?",
  types: { birthday: "יום הולדת", yahrzeit: "אזכרה" },
  hebDate: "תאריך עברי",
  calendar: "לוח שנה",
  day: "יום",
  month: "חודש",
  year: "שנה",
  hebYear: "שנה עברית",
  optional: "רשות",
  years: "שנים קדימה",
  submit: "יצירת יום שנה",
  submitting: "יוצר…",
  cancel: "ביטול",
  toggle: {
    hebrew: "עברי",
    gregorian: "לועזי",
    aria: "החלפת לוח השנה להזנה",
  },
  nameRequired: "יש להזין שם.",
  notConfigured: NOT_CONFIGURED,
  noSuchDate: "תאריך עברי זה אינו קיים (למשל ה-30 בחודש בן 29 יום).",
  rateLimited: "יומן Google עסוק כרגע — המתינו רגע ונסו שוב.",
  error: (message: string) => `משהו השתבש: ${message}`,
  months: hebrewMonths,
} as const satisfies AnniversaryFormTexts;
