import type { CalendarUnavailableTexts } from "@/app/components/anniversary/CalendarUnavailable";

export const calendarUnavailable = {
  title: "Calendrier des anniversaires indisponible",
  message:
    "Le calendrier d’anniversaires partagé n’est pas encore configuré. Vérifiez les identifiants Google dans l’environnement.",
} as const satisfies CalendarUnavailableTexts;
