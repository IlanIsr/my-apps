import type { ConverterTexts } from "@/app/home/HomePage";

import { hebrewMonths as months } from "./hebrew-months";

/** English UI strings — shape: {@link ConverterTexts}. */
export const converter = {
  question: "Do you know the date in Hebrew or Gregorian?",
  gregorian: "Gregorian",
  hebrew: "Hebrew",
  toggleCalendar: "Toggle input calendar",
  hebrewForm: {
    day: "Day",
    month: "Month",
    year: "Year",
    calculate: "Calculate",
    gregorianDate: "Gregorian date:",
    noSuchDate: "That Hebrew date doesn’t occur.",
    months,
  },
  gregorianForm: {
    day: "Day",
    month: "Month",
    year: "Year",
    afterNightfall: "After nightfall",
    calculate: "Calculate",
    invalidDate: "That’s not a valid date.",
  },
} as const satisfies ConverterTexts;
