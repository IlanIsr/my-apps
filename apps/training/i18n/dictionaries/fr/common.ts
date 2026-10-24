import type { AppShellTexts } from "@/app/components/AppShell";
import type { ErrorTexts } from "@/app/components/common";
import type { QuestionBodyTexts } from "@/app/components/QuestionBody";
import type { ResultTexts } from "@/app/components/Results";

export const appShell = {
  brand: "Training",
  language: "Langue",
  nav: {
    questions: "Questions",
    newExam: "Nouvel examen",
    history: "Historique",
    stats: "Statistiques",
  },
} as const satisfies AppShellTexts;

export const errors = {
  "not-signed-in": "Ta session a expiré — reconnecte-toi.",
  invalid: "Certaines informations ne sont pas valides.",
  "not-found": "Introuvable — peut-être supprimé entre-temps.",
  "empty-exam": "Aucune question à mettre dans cet examen.",
  "db-not-configured": "La base de données n’est pas configurée.",
  unknown: "Une erreur est survenue. Réessaie.",
} as const satisfies ErrorTexts;

export const results = {
  correct: "Correct",
  partial: "Partiel",
  incorrect: "Incorrect",
  unrated: "Non corrigé",
} as const satisfies ResultTexts;

export const questionBody = {
  case: "Cas",
  letters: "abcdefghijklmnopqrstuvwxyz",
  siman: "Siman",
  seif: "Seif",
  special: "Spéciale",
  answer: "Réponse",
  noAnswer: "Pas de réponse enregistrée — corrige d’après tes sources.",
  sources: {
    michnaBroura: "Michna Broura",
    biourHalaha: "Biour Halaha",
    kolYaakov: "Kol Yaakov",
    yeriotChelomo: "Yeriot Chelomo",
  },
} as const satisfies QuestionBodyTexts;
