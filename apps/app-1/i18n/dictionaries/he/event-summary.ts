import type { EventSummaryTexts } from "@/lib/event-summary";

/** Hebrew UI strings — shape: {@link EventSummaryTexts}. */
export const eventSummary = {
  birthday: (name: string) => `יום הולדת של ${name}`,
  yahrzeit: (name: string) => `אזכרת ${name}`,
} as const satisfies EventSummaryTexts;
