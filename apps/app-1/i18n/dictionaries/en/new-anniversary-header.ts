import type { NewAnniversaryHeaderTexts } from "@/app/components/anniversary/NewAnniversaryHeader";

export const newAnniversaryHeader = {
  title: "New anniversary",
  subtitle: "Its next years of events will be added to your Google Calendar.",
} as const satisfies NewAnniversaryHeaderTexts;
