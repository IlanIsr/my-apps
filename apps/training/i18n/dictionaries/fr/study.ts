import type { LexiconTexts } from "@/app/components/LexiconView";
import type { NoteFormTexts } from "@/app/components/NoteFormView";
import type { NotesTexts } from "@/app/components/NotesView";
import type { PlanFormTexts } from "@/app/components/PlanFormView";
import type { PlanTexts } from "@/app/components/PlanView";
import type { StudyTexts } from "@/app/components/StudyView";

const passage = {
  masekhet: "Massekhet",
  portion: "Portion",
  whole: "Toute la massekhet",
  custom: "Plage personnalisée",
  perek: "Perek",
  from: "Du",
  to: "Au",
};

export const study = {
  eyebrow: "Étude",
  title: "Mes cursus",
  newPlan: "Nouveau cursus",
  today: "Aujourd’hui",
  next: "Prochaine séance {date}",
  done: "Terminé",
  progress: "{studied}/{total} amudim",
  behind: "{count} amud(im) de retard",
  ahead: "{count} amud(im) d’avance",
  onTrack: "À jour",
  empty: {
    title: "Aucun cursus",
    description:
      "Choisis une massekhet, un rythme et tes jours d’étude : l’app te donne le programme jour par jour.",
  },
} as const satisfies StudyTexts;

export const planForm = {
  eyebrow: "Étude",
  title: "Nouveau cursus",
  subject: "Sujet",
  subjects: { gemara: "Guemara" },
  passage,
  rhythm: "Rythme",
  byPace: "Par séance",
  byDate: "Par date de fin",
  pace: "Quantité par séance",
  paceOption: "{amudim} amud(im) · {dapim} daf",
  endDate: "Date de fin",
  days: "Jours d’étude",
  startDate: "Début",
  summaryPace: "{sessions} séance(s) — fin prévue le {end}.",
  summaryDate:
    "{sessions} séance(s) — environ {perSession} amud(im) par séance.",
  summaryTooShort: "Aucune séance avant cette date.",
  noDays: "Choisis au moins un jour.",
  submit: "Créer le cursus",
  cancel: "Annuler",
} as const satisfies PlanFormTexts;

export const plan = {
  eyebrow: "Cursus",
  back: "Mes cursus",
  today: "Aujourd’hui",
  nextSession: "Prochaine séance — {date}",
  nothingToday: "Plus rien à étudier dans ce cursus.",
  markAll: "Tout marquer comme étudié",
  writeNote: "Écrire une fiche",
  lexicon: "Lexique",
  endsOn: "Fin prévue le {date}",
  catchUp:
    "Tu as du retard : le reste est réparti sur les séances jusqu’à la date de fin.",
  shift: "Décaler la fin au {date}",
  coming: "Prochaines séances",
  showAll: "Tout afficher ({count})",
  showLess: "Afficher moins",
  byPerek: "Par perek",
  perek: "Perek",
  notes: "Fiches",
  noNotes: "Pas encore de fiche sur ce passage.",
  editRhythm: "Modifier le rythme",
  delete: "Supprimer",
  rhythm: {
    title: "Rythme",
    byPace: "Par séance",
    byDate: "Par date de fin",
    pace: "Quantité par séance (à partir d’aujourd’hui)",
    paceOption: "{amudim} amud(im) · {dapim} daf",
    endDate: "Date de fin",
    days: "Jours d’étude",
    save: "Enregistrer",
    cancel: "Annuler",
  },
  deleteConfirm: {
    title: "Supprimer ce cursus ?",
    description: "Son avancement est perdu. Les fiches sont conservées.",
    cancel: "Annuler",
    confirm: "Supprimer",
  },
} as const satisfies PlanTexts;

export const notes = {
  eyebrow: "Étude",
  title: "Fiches",
  newNote: "Nouvelle fiche",
  search: "Rechercher dans les fiches…",
  untitled: "Sans titre",
  noMatch: "Aucune fiche ne correspond.",
  empty: {
    title: "Aucune fiche",
    description:
      "Écris un résumé depuis la séance du jour d’un cursus, ou crée une fiche sur n’importe quel passage.",
  },
} as const satisfies NotesTexts;

export const noteForm = {
  eyebrow: "Fiche",
  newTitle: "Nouvelle fiche",
  editTitle: "Fiche",
  passage,
  title: "Titre",
  titlePlaceholder: "Ex. Zman Kriat Chema",
  content: "Résumé",
  editor: {
    bold: "Gras",
    italic: "Italique",
    underline: "Souligné",
    strike: "Barré",
    heading: "Titre",
    subheading: "Sous-titre",
    bulletList: "Liste à puces",
    orderedList: "Liste numérotée",
    size: "Taille du texte",
    sizes: {
      small: "Petit",
      normal: "Normal",
      large: "Grand",
      huge: "Très grand",
    },
    color: "Couleur du texte",
    highlight: "Surlignage",
    none: "aucun",
  },
  save: "Enregistrer",
  saved: "Enregistré",
  backToPlan: "Retour au cursus",
  delete: "Supprimer",
  deleteConfirm: {
    title: "Supprimer cette fiche ?",
    description: "Elle sera définitivement perdue.",
    cancel: "Annuler",
    confirm: "Supprimer",
  },
} as const satisfies NoteFormTexts;

export const lexicon = {
  eyebrow: "Lexique",
  title: "Lexique",
  terms: "{count} terme(s)",
  allAmudim: "Tous les amudim ({count})",
  amud: "Amud",
  search: "Rechercher un terme ou une traduction…",
  add: "Ajouter un terme",
  addHere: "Ajouter",
  edit: "Modifier",
  delete: "Supprimer",
  emptyAmud: "Aucun terme sur {amud}.",
  noMatch: "Aucun terme ne correspond.",
  abbreviation: "Abréviation",
  abbreviationsOnly: "Abréviations seulement",
  abbreviations: {
    link: "Toutes les abréviations",
    title: "Abréviations",
    description:
      "Toutes les abréviations de ton lexique, toutes massekhtot confondues, par ordre alphabétique.",
    empty:
      "Aucune abréviation — coche « C’est une abréviation » en ajoutant un terme.",
  },
  empty: {
    title: "Lexique vide",
    description:
      "Note les mots et expressions de chaque amud avec ta propre traduction.",
  },
  form: {
    newTitle: "Nouveau terme",
    editTitle: "Modifier le terme",
    term: "Terme",
    termPlaceholder: "Ex. תיובתא",
    translation: "Ma traduction",
    note: "Note (facultatif)",
    isAbbreviation: "C’est une abréviation (ר״ת)",
    save: "Enregistrer",
    saveAndNext: "Enregistrer et ajouter un autre",
    cancel: "Annuler",
  },
  deleteConfirm: {
    title: "Supprimer ce terme ?",
    cancel: "Annuler",
    confirm: "Supprimer",
  },
} as const satisfies LexiconTexts;
