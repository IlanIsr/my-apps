import type { ExamTexts } from "@/app/components/ExamView";
import type { PrintTexts } from "@/app/components/PrintView";

export const exam = {
  eyebrow: "Exam",
  title: "Your turn",
  questionOf: "Question {index} of {total}",
  hint: "Answers are shown at correction time.",
  previous: "Previous",
  next: "Next",
  finish: "Finish and correct",
  print: "Print",
  jumpTo: "Go to question",
  finishConfirm: {
    title: "Finish the exam?",
    description: "{count} question(s) left after this one.",
    cancel: "Keep going",
    confirm: "Finish and correct",
  },
  correction: {
    eyebrow: "Exam",
    title: "Correction",
    hint: "Compare with the answer (or your sources) and rate each question yourself.",
    rated: "{rated}/{total} corrected",
    done: "Correction complete",
    result: "Your result",
    retry: "Redo my mistakes ({count})",
    noRetry: "No mistakes to redo 🎉",
    newExam: "New exam",
    question: "Question {index}",
  },
} as const satisfies ExamTexts;

export const print = {
  back: "Back to the exam",
  print: "Print",
  withKey: "Answer key at the end",
  withLines: "Answer lines",
  withReferences: "References",
  title: "Exam",
  name: "Name:",
  date: "Date:",
  count: "{count} questions",
  key: "Answer key",
} as const satisfies PrintTexts;
