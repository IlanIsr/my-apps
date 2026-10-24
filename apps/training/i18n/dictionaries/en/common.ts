import type { AppShellTexts } from "@/app/components/AppShell";
import type { ErrorTexts } from "@/app/components/common";
import type { QuestionBodyTexts } from "@/app/components/QuestionBody";
import type { ResultTexts } from "@/app/components/Results";

export const appShell = {
  brand: "Training",
  language: "Language",
  nav: {
    questions: "Questions",
    newExam: "New exam",
    history: "History",
    stats: "Statistics",
  },
} as const satisfies AppShellTexts;

export const errors = {
  "not-signed-in": "Your session expired — please sign in again.",
  invalid: "Some of the information isn't valid.",
  "not-found": "Not found — it may have been deleted meanwhile.",
  "empty-exam": "There are no questions to put in this exam.",
  "db-not-configured": "The database isn't configured.",
  unknown: "Something went wrong. Please try again.",
} as const satisfies ErrorTexts;

export const results = {
  correct: "Correct",
  partial: "Partial",
  incorrect: "Incorrect",
  unrated: "Not corrected",
} as const satisfies ResultTexts;

export const questionBody = {
  case: "Case",
  letters: "abcdefghijklmnopqrstuvwxyz",
  siman: "Siman",
  seif: "Seif",
  special: "Special",
  answer: "Answer",
  noAnswer: "No answer saved — correct it against your sources.",
  sources: {
    michnaBroura: "Mishna Berura",
    biourHalaha: "Biur Halacha",
    kolYaakov: "Kol Yaakov",
    yeriotChelomo: "Yeriot Shlomo",
  },
} as const satisfies QuestionBodyTexts;
