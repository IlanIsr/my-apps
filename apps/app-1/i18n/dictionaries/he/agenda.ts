import type { AgendaTexts } from "@/app/components/anniversary/CalendarAgenda";

export const agenda = {
  title: "סדר יום",
  subtitle: "כל אירועי ימי השנה הקרובים, לפי תאריך.",
  empty: "אין אירועי ימי שנה קרובים.",
  nightfall: "צאת הכוכבים",
  calendar: "יומן",
  age: (n: number) => `מלאו ${n}`,
  since: (n: number) => `שנה ${n} לפטירה`,
} as const satisfies AgendaTexts;
