import type { ConverterTexts } from "@/app/home/HomePage";

import { hebrewMonths as months } from "./hebrew-months";

/** Hebrew UI strings — shape: {@link ConverterTexts}. */
export const converter = {
  question: "יודעים את התאריך העברי או הלועזי?",
  gregorian: "לועזי",
  hebrew: "עברי",
  toggleCalendar: "החלפת לוח השנה להזנה",
  hebrewForm: {
    day: "יום",
    month: "חודש",
    calculate: "חשב",
    nextGregorianDate: "התאריך הלועזי הבא:",
    noSuchDate: "תאריך עברי זה אינו קיים.",
    months,
  },
  gregorianForm: {
    day: "יום",
    month: "חודש",
    year: "שנה",
    calculate: "חשב",
    invalidDate: "תאריך לא תקין.",
  },
} as const satisfies ConverterTexts;
