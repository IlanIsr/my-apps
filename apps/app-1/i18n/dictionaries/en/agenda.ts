import type { AgendaTexts } from "@/app/components/anniversary/CalendarAgenda";

export const agenda = {
  title: "Agenda",
  subtitle: "Every upcoming anniversary event, in date order.",
  empty: "No upcoming anniversary events.",
} as const satisfies AgendaTexts;
