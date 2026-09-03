import type { CalendarUnavailableTexts } from "@/app/components/anniversary/CalendarUnavailable";

export const calendarUnavailable = {
  title: "לוח ימי ההולדת אינו זמין",
  message:
    "לוח ימי ההולדת המשותף עדיין לא מוגדר. בדקו את פרטי ההתחברות של Google בסביבה.",
} as const satisfies CalendarUnavailableTexts;
