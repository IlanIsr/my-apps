import type { EventSummaryTexts } from "@/lib/event-summary";

export const eventSummary = {
  format: (name: string) => `Anniversaire de ${name}`,
} as const satisfies EventSummaryTexts;
