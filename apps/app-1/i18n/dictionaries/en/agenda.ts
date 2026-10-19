import type { AgendaTexts } from "@/app/components/anniversary/CalendarAgenda";
import { ordinal } from "./ordinal";

/** English UI strings — shape: {@link AgendaTexts}. */
export const agenda = {
  title: "Agenda",
  subtitle: "Every upcoming anniversary event, in date order.",
  empty: "No upcoming anniversary events.",
  nightfall: "nightfall",
  calendar: "Calendar",
  age: (n: number) => `turns ${n}`,
  since: (n: number) => `${ordinal(n)} yahrzeit`,
} as const satisfies AgendaTexts;
