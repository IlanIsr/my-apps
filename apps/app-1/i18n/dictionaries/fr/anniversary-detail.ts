import type { AnniversaryDetailTexts } from "@/app/components/anniversary/AnniversaryDetail";

export const anniversaryDetail = {
  back: "Tous les anniversaires",
  hebDate: "Date hébraïque",
  members: "Dans la liste",
  upcoming: "Événements à venir",
  edit: "Modifier",
  viewInCalendar: "Ouvrir dans Google Calendar →",
  join: "Ajouter à ma liste",
  joining: "Ajout…",
  leave: "Retirer de ma liste",
  leaving: "Retrait…",
  leaveConfirm: "Vous retirer de cet anniversaire ?",
  rateLimited: "Google Agenda est occupé pour le moment — patientez puis réessayez.",
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
