"use client";

/**
 * `/exams/[id]` — one exam. While active: one question at a time (answers
 * hidden), with prev / next and a jump strip; finishing moves to the
 * correction. Once completed: every question with its answer (if any) and a
 * manual correct / partial / incorrect picker, plus "redo my mistakes".
 * Route boundary: reads its texts.
 */

import { useRouter } from "next/navigation";
import { useState } from "react";

import { SimpleModal } from "@repo/ui/modal";

import {
  completeExamAction,
  rateQuestionAction,
  retryExamAction,
  setExamIndexAction,
} from "@/app/actions";
import { useLanguage, useTranslations, LOCALE_TAG } from "@/i18n";
import {
  examCounts,
  failedIds,
  type Exam,
  type ResultStatus,
} from "@/lib/exam-logic";

import { Button } from "./Button";
import { ErrorLine, fill, formatDate, LinkButton, PageHeader } from "./common";
import { QuestionBody, QuestionMeta } from "./QuestionBody";
import { ResultBar, ResultMark, ResultPicker } from "./Results";

export type ExamTexts = {
  eyebrow: string;
  title: string;
  questionOf: string;
  hint: string;
  previous: string;
  next: string;
  finish: string;
  print: string;
  jumpTo: string;
  finishConfirm: {
    title: string;
    description: string;
    cancel: string;
    confirm: string;
  };
  correction: {
    eyebrow: string;
    title: string;
    hint: string;
    rated: string;
    done: string;
    result: string;
    retry: string;
    noRetry: string;
    newExam: string;
    question: string;
  };
};

export function ExamView({ initialExam }: { initialExam: Exam }) {
  const [exam, setExam] = useState(initialExam);
  return exam.status === "active" ? (
    <TakeExam exam={exam} onCompleted={setExam} />
  ) : (
    <Correction exam={exam} onChange={setExam} />
  );
}

function TakeExam({
  exam,
  onCompleted,
}: {
  exam: Exam;
  onCompleted: (exam: Exam) => void;
}) {
  const messages = useTranslations();
  const t = messages.exam;
  const total = exam.questions.length;
  const [index, setIndex] = useState(Math.min(exam.currentIndex, total - 1));
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const question = exam.questions[index];
  const isLast = index === total - 1;

  function go(next: number) {
    if (next < 0 || next >= total) return;
    setIndex(next);
    // Remember the position (resume on another device); not awaited.
    void setExamIndexAction(exam.id, next);
    window.scrollTo({ top: 0 });
  }

  async function finish() {
    setBusy(true);
    const result = await completeExamAction(exam.id);
    setBusy(false);
    if (!result.ok) {
      setError(messages.errors[result.error]);
      return;
    }
    setConfirming(false);
    window.scrollTo({ top: 0 });
    onCompleted(result.data);
  }

  return (
    <>
      <PageHeader eyebrow={t.eyebrow} title={t.title}>
        <LinkButton href={`/exams/${exam.id}/print`} size="sm">
          {t.print}
        </LinkButton>
      </PageHeader>

      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="eyebrow">
          {fill(t.questionOf, { index: index + 1, total })}
        </span>
        <span className="text-xs text-muted">{t.hint}</span>
      </div>
      <div className="mb-5 h-1 overflow-hidden rounded-full bg-sunken">
        <div
          className="h-full bg-accent transition-[width]"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>

      {question && (
        <article className="sheet ruled min-h-56 space-y-4 px-5 py-6">
          <div className="flex items-start justify-between gap-3">
            <span className="font-display text-3xl text-pencil">
              {index + 1}
            </span>
            <QuestionMeta question={question} t={messages.questionBody} />
          </div>
          <QuestionBody question={question} t={messages.questionBody} />
        </article>
      )}

      <div className="mt-5 flex items-center justify-between gap-2">
        <Button disabled={index === 0} onClick={() => go(index - 1)}>
          ← {t.previous}
        </Button>
        {isLast ? (
          <Button
            variant="primary"
            disabled={busy}
            onClick={() => void finish()}
          >
            {t.finish}
          </Button>
        ) : (
          <Button variant="primary" onClick={() => go(index + 1)}>
            {t.next} →
          </Button>
        )}
      </div>

      {total > 1 && (
        <nav aria-label={t.jumpTo} className="mt-6 flex flex-wrap gap-1.5">
          {exam.questions.map((q, i) => (
            <Button
              key={q.id}
              size="sm"
              variant={i === index ? "primary" : "ghost"}
              aria-current={i === index ? "step" : undefined}
              className="min-w-9 font-mono"
              onClick={() => go(i)}
            >
              {i + 1}
            </Button>
          ))}
        </nav>
      )}

      {!isLast && (
        <div className="mt-8 border-t border-line pt-4">
          <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
            {t.finish}
          </Button>
        </div>
      )}
      <ErrorLine message={error} />

      <SimpleModal
        isOpen={confirming}
        onClose={() => setConfirming(false)}
        isDismissable={!busy}
        title={t.finishConfirm.title}
        description={fill(t.finishConfirm.description, {
          count: total - index - 1,
        })}
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirming(false)}>
              {t.finishConfirm.cancel}
            </Button>
            <Button
              variant="primary"
              disabled={busy}
              onClick={() => void finish()}
            >
              {t.finishConfirm.confirm}
            </Button>
          </>
        }
      />
    </>
  );
}

function Correction({
  exam,
  onChange,
}: {
  exam: Exam;
  onChange: (exam: Exam) => void;
}) {
  const messages = useTranslations();
  const t = messages.exam.correction;
  const { locale } = useLanguage();
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const counts = examCounts(exam);
  const total = exam.questions.length;
  const rated = total - counts.unrated;
  const failed = failedIds(exam).length;

  async function rate(questionId: string, status: ResultStatus | null) {
    const previous = exam;
    // Optimistic; rolled back on failure.
    const results = { ...exam.results };
    if (status) results[questionId] = status;
    else delete results[questionId];
    onChange({ ...exam, results });
    setPending(questionId);
    const result = await rateQuestionAction(exam.id, questionId, status);
    setPending(null);
    if (!result.ok) {
      onChange(previous);
      setError(messages.errors[result.error]);
      return;
    }
    setError(null);
    onChange(result.data);
  }

  async function retry() {
    setBusy(true);
    const result = await retryExamAction(exam.id);
    if (!result.ok) {
      setBusy(false);
      setError(messages.errors[result.error]);
      return;
    }
    router.push(`/exams/${result.data.id}`);
  }

  return (
    <>
      <PageHeader eyebrow={t.eyebrow} title={t.title}>
        <LinkButton href={`/exams/${exam.id}/print`} size="sm">
          {messages.exam.print}
        </LinkButton>
      </PageHeader>

      <section className="sheet mb-6 space-y-3 px-5 py-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-sm text-muted">
            {formatDate(exam.startedAt, LOCALE_TAG[locale])}
          </span>
          <span className="eyebrow">
            {rated === total ? t.done : fill(t.rated, { rated, total })}
          </span>
        </div>
        <ResultBar counts={counts} />
        <dl className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
          {(["correct", "partial", "incorrect", "unrated"] as const).map(
            (k) => (
              <div key={k} className="flex gap-1.5">
                <dt className="text-muted">{messages.results[k]}</dt>
                <dd className="font-mono font-medium">{counts[k]}</dd>
              </div>
            ),
          )}
        </dl>
        <p className="text-sm text-muted">{t.hint}</p>
      </section>

      <ErrorLine message={error} />

      <ol className="space-y-4">
        {exam.questions.map((q, i) => (
          <li key={q.id} className="sheet ruled space-y-4 px-5 py-5">
            <div className="flex items-start justify-between gap-3">
              <span className="font-display text-2xl text-pencil">
                {fill(t.question, { index: i + 1 })}
              </span>
              <ResultMark status={exam.results[q.id]} />
            </div>
            <QuestionMeta question={q} t={messages.questionBody} withSources />
            <QuestionBody question={q} t={messages.questionBody} showAnswer />
            <div className="border-t border-dashed border-line pt-3">
              <ResultPicker
                label={t.result}
                value={exam.results[q.id]}
                disabled={pending === q.id}
                onChange={(status) => void rate(q.id, status)}
                t={messages.results}
              />
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <Button
          variant="primary"
          disabled={busy || failed === 0}
          onClick={() => void retry()}
        >
          {fill(t.retry, { count: failed })}
        </Button>
        <LinkButton href="/exams/new">{t.newExam}</LinkButton>
        {failed === 0 && rated > 0 && (
          <span className="text-sm text-muted">{t.noRetry}</span>
        )}
      </div>
    </>
  );
}
