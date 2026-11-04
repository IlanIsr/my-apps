import type { GlossaryTexts } from "@/app/components/GlossaryView";
import type { SettingsTexts } from "@/app/components/SettingsView";

export const glossary = {
  eyebrow: "Cabinet",
  title: "Glossaire",
  intro:
    "Les traductions imposées pour un terme hébreu, par langue cible. Chaque page qui contient le terme est traduite avec ce rendu, et un signalement apparaît si la traduction ne le reprend pas.",
  hebrew: "Terme hébreu",
  rendering: "Traduction imposée",
  add: "Ajouter",
  search: "Rechercher…",
  emptyTitle: "Glossaire vide",
  emptyText:
    "Ajoutez des termes ici, importez une liste, ou ajoutez-les depuis un signalement « Terme » dans l'atelier.",
  noMatch: "Aucun terme ne correspond.",
  edit: "Modifier",
  save: "Enregistrer",
  cancel: "Annuler",
  remove: "Supprimer",
  importTitle: "Importer une liste",
  importHint:
    "Une entrée par ligne, au format « hébreu = traduction » (une tabulation ou un point-virgule fonctionnent aussi). Un terme déjà présent est remplacé.",
  importButton: "Importer",
  imported: "{n} terme(s) importé(s).",
  importNothing: "Aucune ligne au format « hébreu = traduction ».",
  exportText: "Copier la liste",
  copied: "Liste copiée dans le presse-papiers.",
  count: "{n} terme(s)",
} as const satisfies GlossaryTexts;

export const settings = {
  eyebrow: "Cabinet",
  title: "Réglages",
  certificationHeading: "Certification",
  certificationIntro:
    "Ajoutée à la fin de chaque traduction exportée en Word, dans la langue cible. {date} est remplacé par la date du jour et {pages} par le nombre de pages.",
  translatorName: "Nom du traducteur / notaire",
  translatorNameHint: "Imprimé sous la certification.",
  certification: "Texte de certification",
  certificationPlaceholder: {
    fr: "Je soussigné(e)… certifie que la présente traduction…",
    en: "I, the undersigned… certify that this translation…",
  },
  useTemplate: "Partir d'un modèle",
  template: {
    fr: "Je soussigné(e), [nom], notaire, certifie que la présente traduction de l'hébreu vers le français, comportant {pages} page(s), est conforme à l'original qui m'a été présenté.\nFait à [ville], le {date}.",
    en: "I, the undersigned, [name], notary, hereby certify that this translation from Hebrew into English, consisting of {pages} page(s), is a true and accurate translation of the original document presented to me.\nDone at [city], on {date}.",
  },
  defaultsHeading: "Nouveaux documents",
  defaultsIntro: "Réglages proposés par défaut pour chaque nouveau document.",
  save: "Enregistrer",
  saved: "Réglages enregistrés.",
} as const satisfies SettingsTexts;
