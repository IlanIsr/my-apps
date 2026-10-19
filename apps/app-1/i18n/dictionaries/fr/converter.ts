import type { ConverterTexts } from "@/app/home/HomePage";

import { hebrewMonths as months } from "./hebrew-months";

/** French UI strings — shape: {@link ConverterTexts}. */
export const converter = {
  question: "Connaissez-vous la date en hébreu ou en grégorien ?",
  gregorian: "Grégorien",
  hebrew: "Hébreu",
  toggleCalendar: "Changer le calendrier de saisie",
  hebrewForm: {
    day: "Jour",
    month: "Mois",
    calculate: "Calculer",
    nextGregorianDate: "Prochaine date grégorienne :",
    noSuchDate: "Cette date hébraïque n’existe pas.",
    months,
  },
  gregorianForm: {
    day: "Jour",
    month: "Mois",
    year: "Année",
    calculate: "Calculer",
    invalidDate: "Date invalide.",
  },
} as const satisfies ConverterTexts;
