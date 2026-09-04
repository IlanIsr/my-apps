import type { EventSummaryTexts } from "@/lib/event-summary";

export const eventSummary = {
  birthday: (name: string) => `Anniversaire de ${name}`,
  yahrzeit: (name: string) => `Yahrzeit de ${name}`,
} as const satisfies EventSummaryTexts;
