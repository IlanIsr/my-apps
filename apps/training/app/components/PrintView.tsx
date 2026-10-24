"use client";

/**
 * `/exams/[id]/print` — the exam as a sheet of paper: a header with name /
 * date lines, numbered questions with ruled answer lines, and optionally the
 * answer key on its own page. The toolbar is hidden when printing.
 * Route boundary: reads its texts.
 */

import { useState } from "react";

import { useLanguage, useTranslations, LOCALE_TAG } from "@/i18n";
import type { Exam } from "@/lib/exam-logic";

import { Button } from "./Button";
import { fill, LinkButton } from "./common";
import { QuestionBody, QuestionMeta } from "./QuestionBody";
import { Switch } from "./Switch";

export type PrintTexts = {
  back: string;
  print: string;
  withKey: string;
  withLines: string;
  withReferences: string;
  title: string;
  name: string;
  date: string;
  count: string;
  key: string;
};

export function PrintView({ exam }: { exam: Exam }) {
  const messages = useTranslations();
  const t = messages.print;
  const body = messages.questionBody;
  const { locale } = useLanguage();

  const [withKey, setWithKey] = useState(false);
  const [withLines, setWithLines] = useState(true);
  const [withReferences, setWithReferences] = useState(false);

  return (
    <>
      <div className="sheet mb-6 flex flex-wrap items-center gap-x-5 gap-y-3 px-4 py-3 print:hidden">
        <LinkButton href={`/exams/${exam.id}`} variant="ghost" size="sm">
          ← {t.back}
        </LinkButton>
        <Switch checked={withLines} onChange={setWithLines}>
          {t.withLines}
        </Switch>
        <Switch checked={withReferences} onChange={setWithReferences}>
          {t.withReferences}
        </Switch>
        <Switch checked={withKey} onChange={setWithKey}>
          {t.withKey}
        </Switch>
        <div className="ms-auto">
          <Button variant="primary" onClick={() => window.print()}>
            {t.print}
          </Button>
        </div>
      </div>

      <article className="sheet px-8 py-10 print:border-0 print:p-0 print:shadow-none">
        <header className="mb-8 border-b-2 border-foreground pb-4">
          <div className="flex items-baseline justify-between gap-4">
            <h1 className="text-3xl">{t.title}</h1>
            <span className="font-mono text-sm text-muted">
              {fill(t.count, { count: exam.questions.length })} ·{" "}
              {new Date(exam.startedAt).toLocaleDateString(LOCALE_TAG[locale])}
            </span>
          </div>
          <div className="mt-5 grid grid-cols-[2fr_1fr] gap-6 text-sm">
            <span className="border-b border-line pb-1">{t.name}</span>
            <span className="border-b border-line pb-1">{t.date}</span>
          </div>
        </header>

        <ol className="space-y-8">
          {exam.questions.map((q, i) => (
            <li key={q.id} className="flex gap-4 break-inside-avoid">
              <span className="font-display text-xl font-semibold">
                {i + 1}.
              </span>
              <div className="min-w-0 flex-1 space-y-2">
                {withReferences && <QuestionMeta question={q} t={body} />}
                <QuestionBody
                  question={q}
                  t={body}
                  answerLines={withLines ? 3 : 0}
                />
              </div>
            </li>
          ))}
        </ol>

        {withKey && (
          <section className="mt-12 border-t-2 border-foreground pt-6 print:break-before-page">
            <h2 className="mb-4 text-2xl">{t.key}</h2>
            <ol className="space-y-3 text-sm">
              {exam.questions.map((q, i) => (
                <li key={q.id} className="flex gap-3 break-inside-avoid">
                  <span className="font-mono font-medium">{i + 1}.</span>
                  <div className="min-w-0 flex-1">
                    {q.answer ? (
                      <p dir="auto" className="whitespace-pre-wrap">
                        {q.answer}
                      </p>
                    ) : (
                      <p className="text-muted italic">{body.noAnswer}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}
      </article>
    </>
  );
}
