import type { AnniversaryDetailTexts } from "@/app/components/anniversary/AnniversaryDetail";

export const anniversaryDetail = {
  back: "Tous les anniversaires",
  eyebrow: { birthday: "Anniversaire", yahrzeit: "Yahrzeit" },
  hebDate: "Date hébraïque",
  family: "Famille à cette date",
  upcoming: "À venir",
  edit: "Modifier",
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
  editForm: {
    date: "Date",
    time: "Heure (HH:MM)",
    timeHint: "Laisser vide pour la tombée de la nuit (tset hakochavim)",
    save: "Enregistrer",
    saving: "Enregistrement…",
    cancel: "Annuler",
    error: (message: string) => `Une erreur est survenue : ${message}`,
  },
} as const satisfies AnniversaryDetailTexts;
