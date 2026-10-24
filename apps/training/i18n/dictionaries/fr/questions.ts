import type { QuestionFormTexts } from "@/app/components/QuestionFormView";
import type { QuestionsTexts } from "@/app/components/QuestionsView";

export const questions = {
  eyebrow: "Banque",
  title: "Questions",
  add: "Ajouter une question",
  search: "Rechercher dans les questions, réponses, sources…",
  count: "{count} question(s)",
  filter: {
    label: "Filtrer",
    all: "Toutes",
    special: "Spéciales",
    normal: "Normales",
  },
  edit: "Modifier",
  delete: "Supprimer",
  withAnswer: "Réponse enregistrée",
  deleteConfirm: {
    title: "Supprimer cette question ?",
    description:
      "Elle disparaît de la banque. Les examens passés gardent leur copie.",
    cancel: "Annuler",
    confirm: "Supprimer",
  },
  empty: {
    title: "La banque est vide",
    description:
      "Ajoute tes premières questions pour pouvoir générer un examen.",
  },
  noMatch: "Aucune question ne correspond.",
} as const satisfies QuestionsTexts;

export const questionForm = {
  eyebrow: "Banque",
  newTitle: "Nouvelle question",
  editTitle: "Modifier la question",
  siman: "Siman",
  seif: "Seif",
  withCase: "Commencer par un cas",
  casePlaceholder: "Le texte du cas auquel les questions se rapportent…",
  prompts: "Question(s)",
  promptPlaceholder: "Énoncé de la question…",
  addPrompt: "Ajouter une sous-question",
  removePrompt: "Retirer cette sous-question",
  withAnswer: "Ajouter la réponse",
  answerPlaceholder: "La réponse attendue (pour toute la question)…",
  sources: "Sources",
  special: "Question spéciale",
  specialHint: "Pour la cibler (ou l’exclure) en générant un examen.",
  saveAndNext: "Enregistrer et continuer",
  save: "Enregistrer",
  cancel: "Annuler",
  saved:
    "Question enregistrée. Siman, seif et sources sont gardés pour la suivante.",
  promptRequired: "Écris au moins une question.",
  shortcut: "⌘/Ctrl + Entrée pour enregistrer",
} as const satisfies QuestionFormTexts;
