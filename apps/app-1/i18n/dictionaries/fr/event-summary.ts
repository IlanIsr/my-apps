import type { EventSummaryTexts } from "@/lib/event-summary";

/** French UI strings — shape: {@link EventSummaryTexts}. */
export const eventSummary = {
  birthday: (name: string) => `Anniversaire de ${name}`,
  yahrzeit: (name: string) => `Yahrzeit de ${name}`,
} as const satisfies EventSummaryTexts;
