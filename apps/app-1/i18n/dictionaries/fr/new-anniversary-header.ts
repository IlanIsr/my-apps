import type { NewAnniversaryHeaderTexts } from "@/app/components/anniversary/NewAnniversaryHeader";

/** French UI strings — shape: {@link NewAnniversaryHeaderTexts}. */
export const newAnniversaryHeader = {
  title: "Ajouter un anniversaire",
  subtitle:
    "Ses prochaines années d’événements iront sur le calendrier familial partagé.",
} as const satisfies NewAnniversaryHeaderTexts;
