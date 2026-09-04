import type { AgendaTexts } from "@/app/components/anniversary/CalendarAgenda";

function ordinal(n: number): string {
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

export const agenda = {
  title: "Agenda",
  subtitle: "Every upcoming anniversary event, in date order.",
  empty: "No upcoming anniversary events.",
  nightfall: "nightfall",
  calendar: "Calendar",
  age: (n: number) => `turns ${n}`,
  since: (n: number) => `${ordinal(n)} yahrzeit`,
} as const satisfies AgendaTexts;
