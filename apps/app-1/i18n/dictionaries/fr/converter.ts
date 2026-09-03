import type { ConverterTexts } from "@/app/home/HomePage";

const months = {
  Tishrei: "Tichri",
  Cheshvan: "Hechvan",
  Kislev: "Kislev",
  Tevet: "Tévet",
  Shvat: "Chevat",
  Adar: "Adar",
  Adar1: "Adar I",
  Adar2: "Adar II",
  Nisan: "Nissan",
  Iyyar: "Iyar",
  Sivan: "Sivan",
  Tamuz: "Tamouz",
  Av: "Av",
  Elul: "Eloul",
} as const;

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
