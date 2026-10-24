import type { GenerateTexts } from "@/app/components/GenerateView";
import type { HistoryTexts } from "@/app/components/HistoryView";
import type { StatsTexts } from "@/app/components/StatsView";

export const generate = {
  eyebrow: "Exam",
  title: "Generate an exam",
  bank: "{count} question(s) in the bank",
  filters: "Filters",
  special: {
    label: "Special questions",
    all: "All",
    only: "Only",
    without: "Without",
  },
  history: {
    label: "History",
    all: "All questions",
    unseen: "Never asked",
    incorrect: "Last result: incorrect",
    partial: "Last result: partial",
  },
  reference: "Siman, seif or source",
  referencePlaceholder: "e.g. 128, Mishna Berura 5…",
  count: "Number of questions",
  available: "{count} question(s) match the filters",
  take: "Take the exam ({count})",
  print: "Printable version",
  noMatch: "No question matches the filters.",
  empty: {
    title: "No questions yet",
    description: "An exam is generated from your question bank.",
    add: "Add a question",
  },
} as const satisfies GenerateTexts;

export const history = {
  eyebrow: "Exams",
  title: "History",
  newExam: "New exam",
  count: "{count} question(s)",
  score: "{correct}/{total} correct",
  retryOf: "Mistakes redo",
  status: {
    active: "In progress",
    toCorrect: "To correct",
    corrected: "Corrected",
  },
  delete: "Delete the exam",
  deleteConfirm: {
    title: "Delete this exam?",
    description: "Its results will no longer count in the statistics.",
    cancel: "Cancel",
    confirm: "Delete",
  },
  empty: {
    title: "No exams",
    description: "The exams you generate will show up here.",
  },
} as const satisfies HistoryTexts;

export const stats = {
  eyebrow: "Progress",
  title: "Statistics",
  questions: "Questions",
  questionsDetail: "{special} special · {answers} with an answer",
  exams: "Exams",
  examsDetail: "{completed} finished",
  coverage: "Coverage",
  coverageDetail: "{seen} of {total} already asked",
  mastery: "Mastery",
  masteryDetail: "Latest result correct",
  latest: "Latest result of each question",
  review: "To review",
  reviewEmpty: "Nothing to review yet.",
  edit: "Open",
  empty: {
    title: "Nothing to measure",
    description: "Add questions and take an exam.",
  },
} as const satisfies StatsTexts;
