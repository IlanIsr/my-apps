import type { QuestionFormTexts } from "@/app/components/QuestionFormView";
import type { QuestionsTexts } from "@/app/components/QuestionsView";

export const questions = {
  eyebrow: "Bank",
  title: "Questions",
  add: "Add a question",
  search: "Search questions, answers, sources…",
  count: "{count} question(s)",
  filter: {
    label: "Filter",
    all: "All",
    special: "Special",
    normal: "Normal",
  },
  edit: "Edit",
  delete: "Delete",
  withAnswer: "Answer saved",
  deleteConfirm: {
    title: "Delete this question?",
    description: "It leaves the bank. Past exams keep their own copy.",
    cancel: "Cancel",
    confirm: "Delete",
  },
  empty: {
    title: "The bank is empty",
    description: "Add your first questions to start generating exams.",
  },
  noMatch: "No question matches.",
} as const satisfies QuestionsTexts;

export const questionForm = {
  eyebrow: "Bank",
  newTitle: "New question",
  editTitle: "Edit question",
  siman: "Siman",
  seif: "Seif",
  withCase: "Start with a case",
  casePlaceholder: "The case text the questions refer to…",
  prompts: "Question(s)",
  promptPlaceholder: "Question text…",
  addPrompt: "Add a sub-question",
  removePrompt: "Remove this sub-question",
  withAnswer: "Add the answer",
  answerPlaceholder: "The expected answer (for the whole question)…",
  sources: "Sources",
  special: "Special question",
  specialHint: "So you can target (or skip) it when generating an exam.",
  saveAndNext: "Save and continue",
  save: "Save",
  cancel: "Cancel",
  saved: "Question saved. Siman, seif and sources are kept for the next one.",
  promptRequired: "Write at least one question.",
  shortcut: "⌘/Ctrl + Enter to save",
} as const satisfies QuestionFormTexts;
