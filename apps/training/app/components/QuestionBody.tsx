/**
 * How a question reads everywhere (bank, exam, correction, print): the case
 * text, then the prompts — lettered when there's more than one — and, on
 * request, the answer and the reference / sources line.
 */

import {
  reference,
  SOURCE_KEYS,
  type Question,
  type SourceKey,
} from "@/lib/exam-logic";

export type QuestionBodyTexts = {
  case: string;
  /** The letters used for sub-questions, in order (a, b, c… / א, ב, ג…). */
  letters: string;
  siman: string;
  seif: string;
  special: string;
  answer: string;
  noAnswer: string;
  sources: Record<SourceKey, string>;
};

/** `a`, `b`… — falls back to numbers past the alphabet. */
export function letter(letters: string, index: number): string {
  return [...letters][index] ?? String(index + 1);
}

export function QuestionMeta({
  question,
  t,
  withSources = false,
}: {
  question: Question;
  t: QuestionBodyTexts;
  withSources?: boolean;
}) {
  const ref = reference(question, t);
  const sources = withSources
    ? SOURCE_KEYS.filter((key) => question.sources[key].trim())
    : [];
  if (!ref && !question.isSpecial && sources.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
      {ref && <span className="font-mono">{ref}</span>}
      {question.isSpecial && (
        <span className="rounded-full bg-pencil-soft px-2 py-0.5 font-medium text-pencil">
          ★ {t.special}
        </span>
      )}
      {sources.map((key) => (
        <span key={key} dir="auto">
          <span className="font-medium text-foreground/80">
            {t.sources[key]}
          </span>{" "}
          {question.sources[key]}
        </span>
      ))}
    </div>
  );
}

export function QuestionBody({
  question,
  t,
  showAnswer = false,
  answerLines = 0,
}: {
  question: Question;
  t: QuestionBodyTexts;
  showAnswer?: boolean;
  /** Blank ruled lines under each prompt (printed exams). */
  answerLines?: number;
}) {
  const many = question.prompts.length > 1;

  return (
    <div className="space-y-3">
      {question.cas && (
        <div className="rounded-md border-s-2 border-accent bg-accent-soft/50 px-3 py-2">
          <div className="eyebrow mb-1">{t.case}</div>
          <p dir="auto" className="whitespace-pre-wrap">
            {question.cas}
          </p>
        </div>
      )}

      <ol className="space-y-2">
        {question.prompts.map((prompt, i) => (
          <li key={i} className="flex gap-2">
            {many && (
              <span className="mt-px font-mono text-sm text-muted">
                {letter(t.letters, i)}.
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p
                dir="auto"
                className="font-display text-[17px] whitespace-pre-wrap"
              >
                {prompt}
              </p>
              {answerLines > 0 && (
                <div aria-hidden className="mt-2">
                  {Array.from({ length: answerLines }, (_, l) => (
                    <div
                      key={l}
                      className="h-7 border-b border-dotted border-line"
                    />
                  ))}
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>

      {showAnswer && (
        <div className="rounded-md bg-sunken px-3 py-2">
          <div className="eyebrow mb-1">{t.answer}</div>
          {question.answer ? (
            <p dir="auto" className="whitespace-pre-wrap">
              {question.answer}
            </p>
          ) : (
            <p className="text-sm text-muted italic">{t.noAnswer}</p>
          )}
        </div>
      )}
    </div>
  );
}
