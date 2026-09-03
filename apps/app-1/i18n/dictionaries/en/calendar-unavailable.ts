import type { CalendarUnavailableTexts } from "@/app/components/anniversary/CalendarUnavailable";

export const calendarUnavailable = {
  title: "Anniversaries calendar unavailable",
  message:
    "The shared anniversaries calendar isn’t set up yet. Check the Google credentials in the environment.",
} as const satisfies CalendarUnavailableTexts;
