import type { NewAnniversaryHeaderTexts } from "@/app/components/anniversary/NewAnniversaryHeader";

export const newAnniversaryHeader = {
  title: "Add an anniversary",
  subtitle: "Its next years of events go on the shared family calendar.",
} as const satisfies NewAnniversaryHeaderTexts;
