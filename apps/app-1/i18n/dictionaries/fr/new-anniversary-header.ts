import type { NewAnniversaryHeaderTexts } from "@/app/components/anniversary/NewAnniversaryHeader";

export const newAnniversaryHeader = {
  title: "Ajouter un anniversaire",
  subtitle:
    "Ses prochaines années d’événements iront sur le calendrier familial partagé.",
} as const satisfies NewAnniversaryHeaderTexts;
