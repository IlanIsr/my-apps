import type { AgendaTexts } from "@/app/components/anniversary/CalendarAgenda";

export const agenda = {
  title: "Agenda",
  subtitle: "Tous les prochains événements d’anniversaire, par date.",
  empty: "Aucun événement d’anniversaire à venir.",
} as const satisfies AgendaTexts;
