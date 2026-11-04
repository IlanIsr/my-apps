"use client";

/**
 * The month's goals (‹ month ›): for each, what's left to spend, per day,
 * and where the month ends at this pace; with a cash goal, the savings it
 * leaves after the category goals. A month with none can take the previous
 * month's again in one tap.
 */

import { useRouter } from "next/navigation";
import { useState } from "react";

import { copyGoalsAction } from "@/app/actions";
import {
  formatMonth,
  monthOf,
  savingsGoal,
  shiftMonth,
  type Category,
  type Goal,
  type Transaction,
} from "@/lib/expense-logic";
import { today } from "@/lib/grocery-logic";
import { LOCALE_TAG, useLanguage, useTranslations } from "@/i18n";

import { Button } from "./Button";
import { EmptyState, ErrorLine, fill } from "./common";
import { GoalCard, SavingsCard } from "./GoalCard";
import { GoalModal } from "./GoalModal";

export type GoalsTexts = {
  title: string;
  description: string;
  previous: string;
  next: string;
  add: string;
  emptyTitle: string;
  emptyDescription: string;
  /** `{n}` goals, `{month}`. */
  copy: string;
};

export function GoalsView({
  goals,
  transactions,
  categories,
}: {
  goals: Goal[];
  transactions: Transaction[];
  categories: Category[];
}) {
  const messages = useTranslations();
  const t = messages.goals;
  const tag = LOCALE_TAG[useLanguage().locale];
  const router = useRouter();
  const [month, setMonth] = useState(monthOf(today()));
  const [editing, setEditing] = useState<Goal | "new" | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shown = goals.filter((g) => g.month === month);
  const before = shiftMonth(month, -1);
  const previous = goals.filter((g) => g.month === before);

  async function copy() {
    setBusy(true);
    setError(null);
    const result = await copyGoalsAction(before, month);
    setBusy(false);
    if (!result.ok) return setError(messages.errors[result.error]);
    router.refresh();
  }

  return (
    <div className="pb-24">
      <div className="mb-2 flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          aria-label={t.previous}
          onClick={() => setMonth(shiftMonth(month, -1))}
        >
          <span aria-hidden>‹</span>
        </Button>
        <h1 className="text-2xl capitalize">
          {t.title} · {formatMonth(month, tag)}
        </h1>
        <Button
          variant="ghost"
          aria-label={t.next}
          onClick={() => setMonth(shiftMonth(month, 1))}
        >
          <span aria-hidden>›</span>
        </Button>
      </div>
      <p className="mb-4 text-center text-sm text-muted">{t.description}</p>

      {shown.length === 0 ? (
        <EmptyState title={t.emptyTitle} description={t.emptyDescription}>
          <div className="flex flex-wrap justify-center gap-2">
            {previous.length > 0 && (
              <Button onClick={copy} disabled={busy}>
                {fill(t.copy, {
                  n: previous.length,
                  month: formatMonth(before, tag),
                })}
              </Button>
            )}
            <Button variant="primary" onClick={() => setEditing("new")}>
              + {t.add}
            </Button>
          </div>
          <ErrorLine message={error} />
        </EmptyState>
      ) : (
        <ul className="flex flex-col gap-3">
          {shown.map((g) => (
            <li key={g.id}>
              <Button
                variant="ghost"
                onClick={() => setEditing(g)}
                className="card h-auto w-full p-4 text-start font-normal text-foreground"
              >
                <span className="block w-full">
                  <GoalCard
                    goal={g}
                    transactions={transactions}
                    categories={categories}
                  />
                </span>
              </Button>
            </li>
          ))}
          {savingsGoal(month, goals, transactions, today()) && (
            <li className="card p-4">
              <SavingsCard
                month={month}
                goals={goals}
                transactions={transactions}
              />
            </li>
          )}
        </ul>
      )}

      {shown.length > 0 && (
        <div className="fixed end-5 bottom-5 z-10">
          <Button
            variant="primary"
            isIconOnly
            aria-label={t.add}
            onClick={() => setEditing("new")}
            className="size-14 rounded-full text-2xl shadow-card"
          >
            +
          </Button>
        </div>
      )}

      {editing && (
        <GoalModal
          goal={editing === "new" ? null : editing}
          month={month}
          categories={categories}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
