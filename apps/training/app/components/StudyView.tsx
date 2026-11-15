"use client";

/**
 * `/study` — the study plans: for each, today's portion (or the next one),
 * progress and how far behind / ahead it is. Route boundary: reads its texts.
 */

import Link from "next/link";

import { LOCALE_TAG, useLanguage, useTranslations } from "@/i18n";
import {
  masekhetName,
  planProgress,
  rangeLabel,
  upcoming,
  type StudyPlan,
} from "@/lib/study-logic";

import { EmptyState, fill, LinkButton, PageHeader } from "./common";
import { formatDay, useToday } from "./PassagePicker";

export type StudyTexts = {
  eyebrow: string;
  title: string;
  newPlan: string;
  today: string;
  next: string;
  done: string;
  progress: string;
  behind: string;
  ahead: string;
  onTrack: string;
  empty: { title: string; description: string };
};

export function StatusPill({
  behind,
  done,
  t,
}: {
  behind: number;
  done: boolean;
  t: Pick<StudyTexts, "behind" | "ahead" | "onTrack" | "done">;
}) {
  const [tone, label] = done
    ? ["bg-ok-soft text-ok", t.done]
    : behind > 0
      ? ["bg-pencil-soft text-pencil", fill(t.behind, { count: behind })]
      : behind < 0
        ? ["bg-ok-soft text-ok", fill(t.ahead, { count: -behind })]
        : ["bg-accent-soft text-accent", t.onTrack];
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>
      {label}
    </span>
  );
}

export function ProgressBar({
  value,
  total,
}: {
  value: number;
  total: number;
}) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-sunken">
      <div
        className="h-full rounded-full bg-accent"
        style={{ width: `${total ? (100 * value) / total : 0}%` }}
      />
    </div>
  );
}

export function StudyView({ plans }: { plans: StudyPlan[] }) {
  const t = useTranslations().study;
  const { locale } = useLanguage();
  const hebrew = locale === "he";
  const today = useToday();

  return (
    <>
      <PageHeader eyebrow={t.eyebrow} title={t.title}>
        <LinkButton href="/study/new" variant="primary">
          {t.newPlan}
        </LinkButton>
      </PageHeader>

      {plans.length === 0 ? (
        <EmptyState title={t.empty.title} description={t.empty.description} />
      ) : (
        <ul className="space-y-3">
          {plans.map((plan) => {
            const progress = today ? planProgress(plan, today) : null;
            const next = today ? upcoming(plan, today)[0] : undefined;
            return (
              <li key={plan.id}>
                <Link
                  href={`/study/${plan.id}`}
                  className="sheet block space-y-2 px-4 py-3 transition hover:border-line-strong"
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-display text-lg font-semibold">
                      {masekhetName(plan.book, hebrew)}
                    </span>
                    <span className="font-mono text-xs text-muted">
                      {rangeLabel(plan.startAmud, plan.endAmud, hebrew)}
                    </span>
                    {progress && (
                      <StatusPill
                        behind={progress.behind}
                        done={progress.done}
                        t={t}
                      />
                    )}
                  </div>
                  {next && today && (
                    <p className="text-sm">
                      <span className="text-muted">
                        {next.date === today
                          ? t.today
                          : fill(t.next, {
                              date: formatDay(next.date, LOCALE_TAG[locale]),
                            })}
                        {" · "}
                      </span>
                      <span className="font-medium">
                        {rangeLabel(
                          next.amudim[0]!,
                          next.amudim.at(-1)!,
                          hebrew,
                        )}
                      </span>
                    </p>
                  )}
                  {progress && (
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <ProgressBar
                          value={progress.studied}
                          total={progress.total}
                        />
                      </div>
                      <span className="font-mono text-xs text-muted">
                        {fill(t.progress, {
                          studied: progress.studied,
                          total: progress.total,
                        })}
                      </span>
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
