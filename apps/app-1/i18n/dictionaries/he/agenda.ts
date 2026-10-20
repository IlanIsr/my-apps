import type { AgendaTexts } from "@/app/components/anniversary/CalendarAgenda";

/** Hebrew UI strings — shape: {@link AgendaTexts}. */
export const agenda = {
  title: "סדר יום",
  subtitle: "כל אירועי ימי ההולדת הקרובים, לפי תאריך.",
  empty: "אין אירועי ימי הולדת קרובים.",
  nightfall: "צאת הכוכבים",
  calendar: "יומן",
  age: (n: number) => `מלאו ${n}`,
  since: (n: number) => `שנה ${n} לפטירה`,
} as const satisfies AgendaTexts;
