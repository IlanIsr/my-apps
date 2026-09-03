import type { AnniversaryMessages } from "../en/anniversary";

export const anniversary: AnniversaryMessages = {
  nav: "Anniversaires",
  listPage: {
    title: "Anniversaires hébraïques",
    subtitle:
      "Anniversaires et yahrzeits du calendrier hébraïque, dans votre Google Calendar",
  },
  add: "Ajouter un anniversaire",
  search: "Rechercher…",
  results: {
    count: (n) => `${n} personne${n === 1 ? "" : "s"}`,
    search: (shown, total, query) => `${shown} sur ${total} pour « ${query} »`,
  },
  empty: {
    none: "Aucun événement d’anniversaire dans votre calendrier.",
    noResults: "Aucun résultat.",
    hint: "Ajoutez quelqu’un : ses prochaines années d’événements sont créées dans Google Calendar.",
  },
  card: {
    hebDate: "Date hébraïque",
    sharedWith: "Partagé avec",
    persons: (n) => `${n} personne${n === 1 ? "" : "s"}`,
    nextEvent: "Prochain",
    events: (n) => `${n} événement${n === 1 ? "" : "s"}`,
  },
  detail: {
    back: "← Tous les anniversaires",
    hebDate: "Date hébraïque",
    sharedWith: "Partagé avec",
    upcoming: "Événements à venir",
    deleteAll: "Supprimer tous les événements",
  },
  new: {
    title: "Nouvel anniversaire",
    subtitle:
      "Ses prochaines années d’événements seront ajoutées à votre Google Calendar.",
  },
  form: {
    name: "Nom",
    namePlaceholder: "Ilan Israel Bellaiche",
    hebDate: "Date hébraïque",
    day: "Jour",
    month: "Mois",
    years: "Années à venir",
    sharedEmails: "Partager avec (emails, séparés par des virgules)",
    sharedEmailsPlaceholder: "quelquun@example.com, autre@example.com",
    sharedEmailsHelp:
      "Ils sont ajoutés comme participants optionnels, invisibles entre eux.",
    submit: "Créer les événements",
    submitting: "Création…",
  },
  validation: {
    nameRequired: "Le nom est requis.",
    emailInvalid: (email) => `Email invalide : ${email}`,
  },
  notFound: {
    title: "Anniversaire introuvable",
    message: "Aucun événement de calendrier pour cette personne.",
  },
  toast: {
    created: (n) => `${n} événement${n === 1 ? "" : "s"} créé${n === 1 ? "" : "s"}.`,
    deleted: (n) =>
      `${n} événement${n === 1 ? "" : "s"} supprimé${n === 1 ? "" : "s"}.`,
    error: (message) => `Une erreur est survenue : ${message}`,
  },
};
