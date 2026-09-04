import type { EventSummaryTexts } from "@/lib/event-summary";

export const eventSummary = {
  birthday: (name: string) => `יום הולדת של ${name}`,
  yahrzeit: (name: string) => `אזכרת ${name}`,
} as const satisfies EventSummaryTexts;
