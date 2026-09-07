import type { CalendarUnavailableTexts } from "@/app/components/anniversary/CalendarUnavailable";

/** Hebrew UI strings — shape: {@link CalendarUnavailableTexts}. */
export const calendarUnavailable = {
  title: "לוח ימי ההולדת אינו זמין",
  message:
    "לוח ימי ההולדת המשותף עדיין לא מוגדר. בדקו את פרטי ההתחברות של Google בסביבה.",
} as const satisfies CalendarUnavailableTexts;
