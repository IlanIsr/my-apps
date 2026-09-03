import type { CalendarMessages } from "../en/calendar";

export const calendar: CalendarMessages = {
  nav: "Agenda",
  connect: {
    title: "Connecter Google Calendar",
    subtitle:
      "Autorisez l’accès au calendrier pour créer et gérer les événements d’anniversaire.",
    button: "Connecter Google Calendar",
    signOut: "Se déconnecter",
    connected: "Connecté",
    notConnected: "Non connecté",
    required: "Connectez Google Calendar pour gérer les événements.",
    reconnect:
      "L’accès au calendrier n’a pas été accordé. Déconnectez-vous et reconnectez-vous pour l’accorder.",
  },
  events: {
    title: "Événements Google Calendar",
    none: "Aucun événement pour le moment.",
    list: (n) => `Événements (${n})`,
    date: "Date",
    time: "Heure",
    tsetHakohavim: "Tset hakochavim",
    viewInCalendar: "Ouvrir dans Google Calendar →",
    deleteConfirm: "Supprimer cet événement ?",
    deleteAllConfirm: (name) => `Supprimer tous les événements pour ${name} ?`,
    edit: "Modifier",
    editTime: "Heure (HH:MM)",
    editTimeHint: "Laisser vide pour la tombée de la nuit (tset hakochavim)",
    editShared: "Partagé avec (emails, séparés par des virgules)",
    save: "Enregistrer",
    cancel: "Annuler",
    saving: "Enregistrement…",
  },
  actions: {
    create: "Créer les événements",
    creating: "Création…",
    deleteAll: "Supprimer tous les événements",
    deleting: "Suppression…",
    delete: "Supprimer",
  },
  agenda: {
    title: "Agenda",
    subtitle: "Tous les prochains événements d’anniversaire, par date.",
    empty: "Aucun événement d’anniversaire à venir.",
  },
  eventSummary: (name) => `Anniversaire de ${name}`,
};
