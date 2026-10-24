/**
 * Assembles the app-wide {@link Messages} type from every component's own
 * `XxxTexts`. Add a UI string by extending the owning component's type, then
 * adding it to that feature's file in every `dictionaries/<locale>/`.
 */

import type { AppShellTexts } from "@/app/components/AppShell";
import type { ErrorTexts } from "@/app/components/common";
import type { ExamTexts } from "@/app/components/ExamView";
import type { GenerateTexts } from "@/app/components/GenerateView";
import type { HistoryTexts } from "@/app/components/HistoryView";
import type { PrintTexts } from "@/app/components/PrintView";
import type { QuestionBodyTexts } from "@/app/components/QuestionBody";
import type { QuestionFormTexts } from "@/app/components/QuestionFormView";
import type { QuestionsTexts } from "@/app/components/QuestionsView";
import type { ResultTexts } from "@/app/components/Results";
import type { StatsTexts } from "@/app/components/StatsView";

/** The message tree. Every dictionary must `satisfies Messages`. */
export type Messages = {
  appShell: AppShellTexts;
  errors: ErrorTexts;
  results: ResultTexts;
  questionBody: QuestionBodyTexts;
  questions: QuestionsTexts;
  questionForm: QuestionFormTexts;
  generate: GenerateTexts;
  exam: ExamTexts;
  print: PrintTexts;
  history: HistoryTexts;
  stats: StatsTexts;
};
