import type { GlossaryTexts } from "@/app/components/GlossaryView";
import type { SettingsTexts } from "@/app/components/SettingsView";

export const glossary = {
  eyebrow: "Firm",
  title: "Glossary",
  intro:
    "Imposed renderings for a Hebrew term, per target language. Every page containing the term is translated with that rendering, and a flag appears if the translation doesn't use it.",
  hebrew: "Hebrew term",
  rendering: "Imposed rendering",
  add: "Add",
  search: "Search…",
  emptyTitle: "Empty glossary",
  emptyText:
    "Add terms here, import a list, or add them from a “Term” flag on the workbench.",
  noMatch: "No term matches.",
  edit: "Edit",
  save: "Save",
  cancel: "Cancel",
  remove: "Delete",
  importTitle: "Import a list",
  importHint:
    "One entry per line, as “hebrew = rendering” (a tab or a semicolon also works). An existing term is replaced.",
  importButton: "Import",
  imported: "{n} term(s) imported.",
  importNothing: "No line in the “hebrew = rendering” format.",
  exportText: "Copy the list",
  copied: "List copied to the clipboard.",
  count: "{n} term(s)",
} as const satisfies GlossaryTexts;

export const settings = {
  eyebrow: "Firm",
  title: "Settings",
  certificationHeading: "Certification",
  certificationIntro:
    "Added at the end of every translation exported to Word, in the target language. {date} is replaced by today's date and {pages} by the number of pages.",
  translatorName: "Translator / notary name",
  translatorNameHint: "Printed under the certification.",
  certification: "Certification text",
  certificationPlaceholder: {
    fr: "Je soussigné(e)… certifie que la présente traduction…",
    en: "I, the undersigned… certify that this translation…",
  },
  useTemplate: "Start from a template",
  template: {
    fr: "Je soussigné(e), [nom], notaire, certifie que la présente traduction de l'hébreu vers le français, comportant {pages} page(s), est conforme à l'original qui m'a été présenté.\nFait à [ville], le {date}.",
    en: "I, the undersigned, [name], notary, hereby certify that this translation from Hebrew into English, consisting of {pages} page(s), is a true and accurate translation of the original document presented to me.\nDone at [city], on {date}.",
  },
  defaultsHeading: "New documents",
  defaultsIntro: "Settings suggested by default for every new document.",
  save: "Save",
  saved: "Settings saved.",
} as const satisfies SettingsTexts;
