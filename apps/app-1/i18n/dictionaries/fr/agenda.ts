import type { AgendaTexts } from "@/app/components/anniversary/CalendarAgenda";

export const agenda = {
  title: "Agenda",
  subtitle: "Tous les prochains événements d’anniversaire, par date.",
  empty: "Aucun événement d’anniversaire à venir.",
  nightfall: "tombée de la nuit",
  calendar: "Agenda",
  age: (n: number) => `${n} ans`,
  since: (n: number) => `${n}ᵉ yahrzeit`,
} as const satisfies AgendaTexts;
