import type { EventSummaryTexts } from "@/lib/event-summary";

export const eventSummary = {
  format: (name: string) => `Anniversary of ${name}`,
} as const satisfies EventSummaryTexts;
