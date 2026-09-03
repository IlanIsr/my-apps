import type { EventSummaryTexts } from "@/lib/event-summary";

export const eventSummary = {
  format: (name: string) => `יום הולדת של ${name}`,
} as const satisfies EventSummaryTexts;
