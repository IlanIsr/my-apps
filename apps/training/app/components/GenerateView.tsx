"use client";

/**
 * `/exams/new` — generate an exam: filter the bank (special, history,
 * reference), pick how many questions, then either take it on screen or open
 * its printable version. Both create the same exam, so a printed exam can be
 * corrected in the app later. Route boundary: reads its texts.
 */

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { createExamAction } from "@/app/actions";
import { useTranslations } from "@/i18n";
import {
  DEFAULT_FILTERS,
  filterQuestions,
  LIMITS,
  pickRandom,
  type Exam,
  type ExamFilters,
  type HistoryFilter,
  type Question,
  type SpecialFilter,
} from "@/lib/exam-logic";

import { Button } from "./Button";
import { EmptyState, ErrorLine, fill, LinkButton, PageHeader } from "./common";
import { Segmented } from "./Segmented";
import { Select } from "./Select";
import { TextInput } from "./TextInput";

export type GenerateTexts = {
  eyebrow: string;
  title: string;
  bank: string;
  filters: string;
  special: { label: string; all: string; only: string; without: string };
  history: {
    label: string;
    all: string;
    unseen: string;
    incorrect: string;
    partial: string;
  };
  reference: string;
  referencePlaceholder: string;
  count: string;
  available: string;
  take: string;
  print: string;
  noMatch: string;
  empty: { title: string; description: string; add: string };
};

const DEFAULT_COUNT = 10;

export function GenerateView({
  bank,
  exams,
}: {
  bank: Question[];
  exams: Exam[];
}) {
  const messages = useTranslations();
  const t = messages.generate;
  const router = useRouter();

  const [filters, setFilters] = useState<ExamFilters>(DEFAULT_FILTERS);
  const [count, setCount] = useState(DEFAULT_COUNT);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const available = useMemo(
    () => filterQuestions(bank, exams, filters),
    [bank, exams, filters],
  );
  const max = Math.min(available.length, LIMITS.examQuestions);
  const effective = Math.max(1, Math.min(count || 1, max));

  function update<K extends keyof ExamFilters>(key: K, value: ExamFilters[K]) {
    setFilters((f) => ({ ...f, [key]: value }));
    setError(null);
  }

  async function generate(mode: "take" | "print") {
    if (max === 0) {
      setError(t.noMatch);
      return;
    }
    setBusy(true);
    const ids = pickRandom(available, effective).map((q) => q.id);
    const result = await createExamAction(ids);
    if (!result.ok) {
      setBusy(false);
      setError(messages.errors[result.error]);
      return;
    }
    router.push(
      mode === "take"
        ? `/exams/${result.data.id}`
        : `/exams/${result.data.id}/print`,
    );
  }

  if (bank.length === 0) {
    return (
      <>
        <PageHeader eyebrow={t.eyebrow} title={t.title} />
        <EmptyState title={t.empty.title} description={t.empty.description}>
          <LinkButton href="/questions/new" variant="primary">
            + {t.empty.add}
          </LinkButton>
        </EmptyState>
      </>
    );
  }

  return (
    <>
      <PageHeader eyebrow={t.eyebrow} title={t.title} />

      <div className="space-y-4">
        <section className="sheet space-y-5 px-5 py-5">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-lg">{t.filters}</h2>
            <span className="eyebrow">
              {fill(t.bank, { count: bank.length })}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="eyebrow">{t.special.label}</span>
            <Segmented<SpecialFilter>
              aria-label={t.special.label}
              value={filters.special}
              onChange={(v) => update("special", v)}
              options={[
                { value: "all", label: t.special.all },
                { value: "only", label: t.special.only },
                { value: "without", label: t.special.without },
              ]}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <span className="eyebrow">{t.history.label}</span>
              <Select
                aria-label={t.history.label}
                value={filters.history}
                onChange={(v) => update("history", v as HistoryFilter)}
                options={(
                  ["all", "unseen", "incorrect", "partial"] as const
                ).map((key) => ({ key, label: t.history[key] }))}
              />
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="eyebrow">{t.reference}</span>
              <TextInput
                dir="auto"
                type="search"
                placeholder={t.referencePlaceholder}
                value={filters.reference}
                onChange={(e) => update("reference", e.target.value)}
              />
            </label>
          </div>
        </section>

        <section className="sheet ruled space-y-4 px-5 py-5">
          <div className="flex flex-wrap items-end gap-4">
            <label className="flex w-44 flex-col gap-1.5">
              <span className="eyebrow">{t.count}</span>
              <TextInput
                type="number"
                inputMode="numeric"
                min={1}
                max={Math.max(1, max)}
                value={String(count)}
                onChange={(e) => setCount(Number(e.target.value))}
              />
            </label>
            <p className="pb-2 text-sm text-muted">
              {fill(t.available, { count: available.length })}
            </p>
          </div>

          <ErrorLine message={error ?? (max === 0 ? t.noMatch : null)} />

          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              disabled={busy || max === 0}
              onClick={() => void generate("take")}
            >
              {fill(t.take, { count: max === 0 ? 0 : effective })}
            </Button>
            <Button
              disabled={busy || max === 0}
              onClick={() => void generate("print")}
            >
              {t.print}
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
