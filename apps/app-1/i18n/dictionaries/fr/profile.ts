import type { ProfileTexts } from "@/app/profile/ProfileView";
import { hebrewMonths } from "./hebrew-months";

export const profile = {
  title: "Profil",
  intro: "Vos préférences pour l'application.",
  minhag: {
    title: "Minhag",
    sephardi: "Séfarade",
    ashkenazi: "Ashkénaze",
    hint: "Séfarade : « Azkara », et Adar II par défaut les années à deux Adar. Ashkénaze : « Yortzeit », et Adar I par défaut.",
  },
  saved: "Enregistré.",
  error: "Impossible d'enregistrer. Réessayez.",
  csvImport: {
    title: "Importer un CSV",
    intro:
      "Format accepté : l'export CSV de Hebcal (hebcal.com → Yahrzeit + Anniversary → CSV). Dates jj/mm/aaaa ou mm/jj/aaaa. Chaque personne est ajoutée à votre liste ; si elle existe déjà, vous la rejoignez.",
    otherFormat: "Votre fichier vient d'ailleurs ?",
    contact: "Contactez-nous",
    contactAfter: " et on s'en occupe.",
    choose: "Choisir un fichier…",
    nothingFound: "Aucun anniversaire reconnu dans ce fichier.",
    found: (people: number, skipped: number) =>
      `${people} personne${people === 1 ? "" : "s"} trouvée${people === 1 ? "" : "s"}` +
      (skipped
        ? ` · ${skipped} ligne${skipped === 1 ? "" : "s"} ignorée${skipped === 1 ? "" : "s"}`
        : ""),
    type: "Type",
    types: { birthday: "Anniversaire", yahrzeit: "Azkara" },
    dates: (n: number) => `${n} date${n === 1 ? "" : "s"} dans le fichier`,
    year: (y: number) => `année ${y}`,
    import: (n: number) => `Importer (${n})`,
    importing: (done: number, total: number) => `Import… ${done}/${total}`,
    status: { created: "Ajouté", joined: "Déjà là — rejoint", failed: "Échec" },
    rateLimited:
      "Google Agenda est occupé — patientez une minute, puis relancez pour importer le reste.",
    done: (created: number, joined: number, failed: number) =>
      `Terminé : ${created} ajouté${created === 1 ? "" : "s"}, ${joined} rejoint${joined === 1 ? "" : "s"}` +
      (failed ? `, ${failed} en échec` : "") +
      ".",
    months: hebrewMonths,
  },
  calendarFeed: {
    title: "Calendrier Apple / Outlook",
    intro:
      "Abonnez-vous à vos anniversaires depuis Calendrier (iPhone, Mac), Outlook ou tout autre agenda. Lecture seule ; votre agenda le met à jour tout seul, avec parfois quelques heures de délai. Ce lien est personnel : ne le partagez pas.",
    show: "Obtenir mon lien",
    loading: "Chargement…",
    subscribe: "S'abonner dans Calendrier",
    otherApps:
      "Autre agenda (Outlook, Google « À partir de l'URL »…) : copiez ce lien.",
    copy: "Copier",
    copied: "Copié",
    renew: "Nouveau lien",
    renewHint:
      "L'ancien lien cesse de fonctionner : il faudra vous réabonner avec le nouveau.",
    error: "Impossible d'obtenir le lien. Réessayez.",
    calendarName: "Anniversaires",
  },
} as const satisfies ProfileTexts;
