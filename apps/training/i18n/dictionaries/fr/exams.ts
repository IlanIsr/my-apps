import type { GenerateTexts } from "@/app/components/GenerateView";
import type { HistoryTexts } from "@/app/components/HistoryView";
import type { StatsTexts } from "@/app/components/StatsView";

export const generate = {
  eyebrow: "Examen",
  title: "Générer un examen",
  bank: "{count} question(s) dans la banque",
  filters: "Filtres",
  special: {
    label: "Questions spéciales",
    all: "Toutes",
    only: "Seulement",
    without: "Sans",
  },
  history: {
    label: "Historique",
    all: "Toutes les questions",
    unseen: "Jamais posées",
    incorrect: "Dernier résultat : incorrect",
    partial: "Dernier résultat : partiel",
  },
  reference: "Siman, seif ou source",
  referencePlaceholder: "Ex. 128, Michna Broura 5…",
  count: "Nombre de questions",
  available: "{count} question(s) correspondent aux filtres",
  take: "Passer l’examen ({count})",
  print: "Version imprimable",
  noMatch: "Aucune question ne correspond aux filtres.",
  empty: {
    title: "Pas encore de questions",
    description: "Un examen se génère à partir de ta banque de questions.",
    add: "Ajouter une question",
  },
} as const satisfies GenerateTexts;

export const history = {
  eyebrow: "Examens",
  title: "Historique",
  newExam: "Nouvel examen",
  count: "{count} question(s)",
  score: "{correct}/{total} correct",
  retryOf: "Reprise des erreurs",
  status: {
    active: "En cours",
    toCorrect: "À corriger",
    corrected: "Corrigé",
  },
  delete: "Supprimer l’examen",
  deleteConfirm: {
    title: "Supprimer cet examen ?",
    description: "Ses résultats ne compteront plus dans les statistiques.",
    cancel: "Annuler",
    confirm: "Supprimer",
  },
  empty: {
    title: "Aucun examen",
    description: "Les examens que tu génères apparaîtront ici.",
  },
} as const satisfies HistoryTexts;

export const stats = {
  eyebrow: "Progrès",
  title: "Statistiques",
  questions: "Questions",
  questionsDetail: "{special} spéciale(s) · {answers} avec réponse",
  exams: "Examens",
  examsDetail: "{completed} terminé(s)",
  coverage: "Couverture",
  coverageDetail: "{seen} sur {total} déjà posées",
  mastery: "Maîtrise",
  masteryDetail: "Dernier résultat correct",
  latest: "Dernier résultat de chaque question",
  review: "À revoir",
  reviewEmpty: "Rien à revoir pour l’instant.",
  edit: "Ouvrir",
  empty: {
    title: "Rien à mesurer",
    description: "Ajoute des questions et passe un examen.",
  },
} as const satisfies StatsTexts;
