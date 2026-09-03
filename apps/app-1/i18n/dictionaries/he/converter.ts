import type { ConverterTexts } from "@/app/home/HomePage";

const months = {
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
} as const;

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
