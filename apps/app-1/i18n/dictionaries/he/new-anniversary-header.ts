import type { NewAnniversaryHeaderTexts } from "@/app/components/anniversary/NewAnniversaryHeader";

/** Hebrew UI strings — shape: {@link NewAnniversaryHeaderTexts}. */
export const newAnniversaryHeader = {
  title: "יום שנה חדש",
  subtitle: "השנים הקרובות של האירועים יתווספו ליומן המשפחתי המשותף.",
} as const satisfies NewAnniversaryHeaderTexts;
