"use client";

/**
 * One goal's progress: what it caps, spent / goal, a bar, what's left (per
 * day too in the current month) and where the month ends at this pace.
 * `compact` = the home page's one-line version.
 */

import {
  categoryLabel,
  goalProgress,
  METHOD_ICON,
  type Category,
  type Goal,
  type Transaction,
} from "@/lib/expense-logic";
import { formatMoney, today } from "@/lib/grocery-logic";
import { LOCALE_TAG, useLanguage, useTranslations } from "@/i18n";

import { fill } from "./common";
import { Bar } from "./GroceryStats";

export type GoalCardTexts = {
  total: string;
  /** `{spent}`, `{amount}`. */
  spentOf: string;
  /** `{amount}`. */
  remaining: string;
  /** `{amount}`. */
  over: string;
  /** `{amount}` per day, `{days}` days left. */
  perDay: string;
  /** `{amount}`. */
  projection: string;
  /** `{amount}` — the pace ends above the goal. */
  projectionOver: string;
};

/** "🛒 Supermarché", "💵 Espèces" or "Toutes les dépenses" (+ its name). */
export function useGoalLabel() {
  const messages = useTranslations();
  return (goal: Goal, categories: Category[]) => {
    let what = messages.goalCard.total;
    if (goal.scope === "category") {
      const c = categories.find((x) => x.id === goal.categoryId);
      what = c ? `${c.icon} ${categoryLabel(c, messages.categoryNames)}` : "?";
    } else if (goal.scope === "method" && goal.method) {
      what = `${METHOD_ICON[goal.method]} ${messages.methods[goal.method]}`;
    }
    return goal.name ? { title: goal.name, what } : { title: what, what: null };
  };
}

export function GoalCard({
  goal,
  transactions,
  categories,
  compact = false,
}: {
  goal: Goal;
  transactions: Transaction[];
  categories: Category[];
  compact?: boolean;
}) {
  const t = useTranslations().goalCard;
  const tag = LOCALE_TAG[useLanguage().locale];
  const label = useGoalLabel()(goal, categories);
  const p = goalProgress(goal, transactions, today());
  const tone =
    p.state === "over" ? "danger" : p.state === "near" ? "warn" : "accent";
  const money = (n: number) => formatMoney(n, tag);
  const left =
    p.remaining >= 0
      ? fill(t.remaining, { amount: money(p.remaining) })
      : fill(t.over, { amount: money(-p.remaining) });

  if (compact) {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline justify-between gap-2 text-sm">
          <span className="truncate">{label.title}</span>
          <span
            className={`num shrink-0 text-xs font-medium ${
              p.remaining < 0 ? "text-danger" : "text-muted"
            }`}
          >
            {left}
          </span>
        </div>
        <Bar value={p.spent} max={goal.amount} tone={tone} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate font-medium">{label.title}</div>
          {label.what && (
            <div className="truncate text-xs text-muted">{label.what}</div>
          )}
        </div>
        <div
          className={`num shrink-0 text-lg font-semibold ${
            p.remaining < 0 ? "text-danger" : ""
          }`}
        >
          {left}
        </div>
      </div>
      <Bar value={p.spent} max={goal.amount} tone={tone} />
      <div className="num flex flex-wrap justify-between gap-x-3 gap-y-1 text-xs text-muted">
        <span>
          {fill(t.spentOf, {
            spent: money(p.spent),
            amount: money(goal.amount),
          })}
        </span>
        {p.perDay !== null && p.daysLeft !== null && p.remaining > 0 && (
          <span>
            {fill(t.perDay, { amount: money(p.perDay), days: p.daysLeft })}
          </span>
        )}
      </div>
      {p.projection !== null && (
        <div
          className={`num text-xs ${
            p.projection > goal.amount ? "text-warn" : "text-muted"
          }`}
        >
          {fill(p.projection > goal.amount ? t.projectionOver : t.projection, {
            amount: money(p.projection),
          })}
        </div>
      )}
    </div>
  );
}
