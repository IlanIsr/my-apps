import type { AnniversaryDetailTexts } from "@/app/components/anniversary/AnniversaryDetail";

const NOT_CONNECTED =
  "L’accès au calendrier n’a pas été accordé. Déconnectez-vous et reconnectez-vous pour l’accorder.";

export const anniversaryDetail = {
  back: "← Tous les anniversaires",
  hebDate: "Date hébraïque",
  sharedWith: "Partagé avec",
  upcoming: "Événements à venir",
  deleteAll: "Supprimer tous les événements",
  delete: "Supprimer",
  edit: "Modifier",
  viewInCalendar: "Ouvrir dans Google Calendar →",
  deleteConfirm: "Supprimer cet événement ?",
  deleteAllConfirm: (name: string) =>
    `Supprimer tous les événements pour ${name} ?`,
  error: (message: string) => `Une erreur est survenue : ${message}`,
  editForm: {
    date: "Date",
    time: "Heure (HH:MM)",
    timeHint: "Laisser vide pour la tombée de la nuit (tset hakochavim)",
    shared: "Partagé avec (emails, séparés par des virgules)",
    save: "Enregistrer",
    saving: "Enregistrement…",
    cancel: "Annuler",
    notConnected: NOT_CONNECTED,
  },
} as const satisfies AnniversaryDetailTexts;
