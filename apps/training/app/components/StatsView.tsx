"use client";

/**
 * `/stats` — bank size, exams, coverage (share of the bank already asked),
 * mastery (share of rated questions whose latest result is correct), the
 * latest-result distribution and the questions to review. Route boundary:
 * reads its texts.
 */

import { useMemo } from "react";

import { useTranslations } from "@/i18n";
import { statistics, type Exam, type Question } from "@/lib/exam-logic";

import { EmptyState, fill, LinkButton, PageHeader } from "./common";
import { QuestionMeta } from "./QuestionBody";
import { ResultBar } from "./Results";

export type StatsTexts = {
  eyebrow: string;
  title: string;
  questions: string;
  questionsDetail: string;
  exams: string;
  examsDetail: string;
  coverage: string;
  coverageDetail: string;
  mastery: string;
  masteryDetail: string;
  latest: string;
  review: string;
  reviewEmpty: string;
  edit: string;
  empty: { title: string; description: string };
};

function Tile({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="sheet px-4 py-4">
      <div className="eyebrow">{label}</div>
      <div className="mt-1 font-display text-4xl">{value}</div>
      <div className="mt-1 text-xs text-muted">{detail}</div>
    </div>
  );
}

export function StatsView({
  bank,
  exams,
}: {
  bank: Question[];
  exams: Exam[];
}) {
  const messages = useTranslations();
  const t = messages.stats;
  const s = useMemo(() => statistics(bank, exams), [bank, exams]);

  if (bank.length === 0) {
    return (
      <>
        <PageHeader eyebrow={t.eyebrow} title={t.title} />
        <EmptyState title={t.empty.title} description={t.empty.description} />
      </>
    );
  }

  return (
    <>
      <PageHeader eyebrow={t.eyebrow} title={t.title} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile
          label={t.questions}
          value={String(s.questions)}
          detail={fill(t.questionsDetail, {
            special: s.special,
            answers: s.withAnswer,
          })}
        />
        <Tile
          label={t.exams}
          value={String(s.exams)}
          detail={fill(t.examsDetail, { completed: s.completedExams })}
        />
        <Tile
          label={t.coverage}
          value={`${s.coverage}%`}
          detail={fill(t.coverageDetail, { seen: s.seen, total: s.questions })}
        />
        <Tile
          label={t.mastery}
          value={`${s.mastery}%`}
          detail={t.masteryDetail}
        />
      </div>

      <section className="sheet mt-4 space-y-3 px-5 py-4">
        <h2 className="text-lg">{t.latest}</h2>
        <ResultBar counts={s.latest} className="h-2.5" />
        <dl className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
          {(["correct", "partial", "incorrect", "unrated"] as const).map(
            (k) => (
              <div key={k} className="flex gap-1.5">
                <dt className="text-muted">{messages.results[k]}</dt>
                <dd className="font-mono font-medium">{s.latest[k]}</dd>
              </div>
            ),
          )}
        </dl>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-lg">{t.review}</h2>
        {s.difficult.length === 0 ? (
          <p className="text-sm text-muted">{t.reviewEmpty}</p>
        ) : (
          <ul className="space-y-2">
            {s.difficult.slice(0, 30).map((d) => (
              <li
                key={d.question.id}
                className="sheet ruled flex items-start gap-3 px-4 py-3"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <p dir="auto" className="line-clamp-2 font-display">
                    {d.question.cas ?? d.question.prompts[0]}
                  </p>
                  <QuestionMeta
                    question={d.question}
                    t={messages.questionBody}
                  />
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="font-mono text-xs">
                    <span className="text-ko">✗ {d.incorrect}</span>{" "}
                    <span className="text-part">½ {d.partial}</span>{" "}
                    <span className="text-ok">✓ {d.correct}</span>
                  </span>
                  <LinkButton
                    href={`/questions/${d.question.id}`}
                    variant="ghost"
                    size="sm"
                  >
                    {t.edit}
                  </LinkButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
