import type { AgendaTexts } from "@/app/components/anniversary/CalendarAgenda";

export const agenda = {
  title: "סדר יום",
  subtitle: "כל אירועי ימי ההולדת הקרובים, לפי תאריך.",
  empty: "אין אירועי ימי הולדת קרובים.",
} as const satisfies AgendaTexts;
