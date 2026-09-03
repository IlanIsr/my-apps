import type { ConverterTexts } from "@/app/home/HomePage";

const months = {
  Tishrei: "Tishrei",
  Cheshvan: "Cheshvan",
  Kislev: "Kislev",
  Tevet: "Tevet",
  Shvat: "Shvat",
  Adar: "Adar",
  Adar1: "Adar I",
  Adar2: "Adar II",
  Nisan: "Nisan",
  Iyyar: "Iyar",
  Sivan: "Sivan",
  Tamuz: "Tamuz",
  Av: "Av",
  Elul: "Elul",
} as const;

export const converter = {
  question: "Do you know the date in Hebrew or Gregorian?",
  gregorian: "Gregorian",
  hebrew: "Hebrew",
  toggleCalendar: "Toggle input calendar",
  hebrewForm: {
    day: "Day",
    month: "Month",
    calculate: "Calculate",
    nextGregorianDate: "Next Gregorian date:",
    noSuchDate: "That Hebrew date doesn’t occur.",
    months,
  },
  gregorianForm: {
    day: "Day",
    month: "Month",
    year: "Year",
    calculate: "Calculate",
    invalidDate: "That’s not a valid date.",
  },
} as const satisfies ConverterTexts;
