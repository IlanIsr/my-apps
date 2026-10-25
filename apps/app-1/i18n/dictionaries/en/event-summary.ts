import type { EventSummaryTexts } from "@/lib/event-summary";

/** English UI strings — shape: {@link EventSummaryTexts}. */
export const eventSummary = {
  birthday: (name: string) => `Birthday of ${name}`,
  yahrzeit: (name: string) => `Azkara of ${name}`,
} as const satisfies EventSummaryTexts;
