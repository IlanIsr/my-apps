import type { Messages } from "../../messages";
import { appShell, errors, questionBody, results } from "./common";
import { exam, print } from "./exam";
import { generate, history, stats } from "./exams";
import { questionForm, questions } from "./questions";

/** The assembled message tree for this locale. */
export const he = {
  appShell,
  errors,
  results,
  questionBody,
  questions,
  questionForm,
  generate,
  exam,
  print,
  history,
  stats,
} as const satisfies Messages;
