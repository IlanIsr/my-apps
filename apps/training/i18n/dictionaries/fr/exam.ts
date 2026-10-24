import type { ExamTexts } from "@/app/components/ExamView";
import type { PrintTexts } from "@/app/components/PrintView";

export const exam = {
  eyebrow: "Examen",
  title: "À toi de jouer",
  questionOf: "Question {index} sur {total}",
  hint: "Les réponses s’affichent à la correction.",
  previous: "Précédente",
  next: "Suivante",
  finish: "Terminer et corriger",
  print: "Imprimer",
  jumpTo: "Aller à la question",
  finishConfirm: {
    title: "Terminer l’examen ?",
    description: "Il reste {count} question(s) après celle-ci.",
    cancel: "Continuer",
    confirm: "Terminer et corriger",
  },
  correction: {
    eyebrow: "Examen",
    title: "Correction",
    hint: "Compare avec la réponse (ou tes sources) et note chaque question toi-même.",
    rated: "{rated}/{total} corrigée(s)",
    done: "Correction terminée",
    result: "Ton résultat",
    retry: "Refaire mes erreurs ({count})",
    noRetry: "Aucune erreur à refaire 🎉",
    newExam: "Nouvel examen",
    question: "Question {index}",
  },
} as const satisfies ExamTexts;

export const print = {
  back: "Retour à l’examen",
  print: "Imprimer",
  withKey: "Corrigé à la fin",
  withLines: "Lignes de réponse",
  withReferences: "Références",
  title: "Examen",
  name: "Nom :",
  date: "Date :",
  count: "{count} questions",
  key: "Corrigé",
} as const satisfies PrintTexts;
