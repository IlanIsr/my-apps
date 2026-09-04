import type { EventSummaryTexts } from "@/lib/event-summary";

export const eventSummary = {
  birthday: (name: string) => `Birthday of ${name}`,
  yahrzeit: (name: string) => `Yahrzeit of ${name}`,
} as const satisfies EventSummaryTexts;
