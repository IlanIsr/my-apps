import type { AnniversaryDetailTexts } from "@/app/components/anniversary/AnniversaryDetail";
import { createShareLinkModal } from "./create-share-link-modal";
import { hebrewMonths } from "./hebrew-months";

/** French UI strings — shape: {@link AnniversaryDetailTexts}. */
export const anniversaryDetail = {
  back: "Tous les anniversaires",
  eyebrow: { birthday: "Anniversaire", yahrzeit: "Yahrzeit" },
  hebDate: "Date hébraïque",
  family: "Famille à cette date",
  upcoming: "À venir",
  editDetails: "Modifier les infos",
  shareThis: "Partager celui-ci",
  viewInCalendar: "Google Agenda ↗",
  nightfall: "tombée de la nuit",
  join: "Ajouter à ma liste",
  joining: "Ajout…",
  leave: "Quitter cette liste",
  leaving: "Retrait…",
  leaveConfirm: "Vous retirer de cet anniversaire ?",
  rateLimited:
    "Google Agenda est occupé pour le moment — patientez puis réessayez.",
  age: (n: number) => `${n} ans`,
  since: (n: number) => `${n}ᵉ yahrzeit`,
  error: (message: string) => `Une erreur est survenue : ${message}`,
  editPersonForm: {
    name: "Nom",
    hebDate: "Date hébraïque",
    calendar: "Calendrier",
    day: "Jour",
    month: "Mois",
    year: "Année",
    hebrewName: "Nom hébraïque",
    hebYear: "Année hébraïque",
    optional: "facultatif",
    save: "Enregistrer",
    saving: "Enregistrement…",
    cancel: "Annuler",
    toggle: {
      hebrew: "Hébreu",
      gregorian: "Grégorien",
      aria: "Changer le calendrier de saisie",
    },
    nameRequired: "Le nom est requis.",
    noSuchDate:
      "Cette date hébraïque n’existe pas (ex. le 30 d’un mois de 29 jours).",
    rateLimited:
      "Google Agenda est occupé pour le moment — patientez puis réessayez.",
    error: (message: string) => `Une erreur est survenue : ${message}`,
    months: hebrewMonths,
  },
  shareModal: createShareLinkModal,
} as const satisfies AnniversaryDetailTexts;
