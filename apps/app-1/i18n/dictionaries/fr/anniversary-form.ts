import type { AnniversaryFormTexts } from "@/app/components/anniversary/AnniversaryForm";

import { hebrewMonths } from "./hebrew-months";

const NOT_CONFIGURED =
  "Le calendrier d’anniversaires partagé n’est pas encore configuré.";

/** French UI strings — shape: {@link AnniversaryFormTexts}. */
export const anniversaryForm = {
  name: "Nom",
  namePlaceholder: "Ilan Israel Bellaiche",
  type: "De quoi s’agit-il ?",
  types: { birthday: "Anniversaire", yahrzeit: "Yahrzeit" },
  hebDate: "Date hébraïque",
  calendar: "Calendrier",
  day: "Jour",
  month: "Mois",
  year: "Année",
  hebYear: "Année hébraïque",
  optional: "facultatif",
  years: "Années à venir",
  submit: "Créer l’anniversaire",
  submitting: "Création…",
  cancel: "Annuler",
  toggle: {
    hebrew: "Hébreu",
    gregorian: "Grégorien",
    aria: "Changer le calendrier de saisie",
  },
  nameRequired: "Le nom est requis.",
  notConfigured: NOT_CONFIGURED,
  noSuchDate:
    "Cette date hébraïque n’existe pas (ex. le 30 d’un mois de 29 jours).",
  rateLimited:
    "Google Agenda est occupé pour le moment — patientez puis réessayez.",
  error: (message: string) => `Une erreur est survenue : ${message}`,
  months: hebrewMonths,
} as const satisfies AnniversaryFormTexts;
