import type { AnniversaryFormTexts } from "@/app/components/anniversary/AnniversaryForm";

const NOT_CONNECTED =
  "L’accès au calendrier n’a pas été accordé. Déconnectez-vous et reconnectez-vous pour l’accorder.";

export const anniversaryForm = {
  name: "Nom",
  namePlaceholder: "Ilan Israel Bellaiche",
  hebDate: "Date hébraïque",
  day: "Jour",
  month: "Mois",
  year: "Année",
  years: "Années à venir",
  sharedEmails: "Partager avec (emails, séparés par des virgules)",
  sharedEmailsPlaceholder: "quelquun@example.com, autre@example.com",
  sharedEmailsHelp:
    "Ils sont ajoutés comme participants optionnels, invisibles entre eux.",
  submit: "Créer les événements",
  submitting: "Création…",
  toggle: {
    hebrew: "Hébreu",
    gregorian: "Grégorien",
    aria: "Changer le calendrier de saisie",
  },
  nameRequired: "Le nom est requis.",
  emailInvalid: (email: string) => `Email invalide : ${email}`,
  notConnected: NOT_CONNECTED,
  error: (message: string) => `Une erreur est survenue : ${message}`,
  months: {
    Tishrei: "Tichri",
    Cheshvan: "Hechvan",
    Kislev: "Kislev",
    Tevet: "Tévet",
    Shvat: "Chevat",
    Adar: "Adar",
    Adar1: "Adar I",
    Adar2: "Adar II",
    Nisan: "Nissan",
    Iyyar: "Iyar",
    Sivan: "Sivan",
    Tamuz: "Tamouz",
    Av: "Av",
    Elul: "Eloul",
  },
} as const satisfies AnniversaryFormTexts;
