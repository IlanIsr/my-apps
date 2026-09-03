import type { NewAnniversaryHeaderTexts } from "@/app/components/anniversary/NewAnniversaryHeader";

export const newAnniversaryHeader = {
  title: "Nouvel anniversaire",
  subtitle:
    "Ses prochaines années d’événements seront ajoutées à votre Google Calendar.",
} as const satisfies NewAnniversaryHeaderTexts;
