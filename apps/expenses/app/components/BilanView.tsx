"use client";

/**
 * The Bilan: one month (‹ month ›) by category against each budget, the
 * cash / card split, the last 12 months, then the groceries details (only
 * the receipts whose expense is in Groceries).
 */

import Link from "next/link";
import { useState } from "react";

import {
  budgetState,
  categoryLabel,
  formatMonth,
  GROCERIES_KEY,
  METHOD_ICON,
  METHODS,
  monthlyTotals,
  monthOf,
  shiftMonth,
  summarize,
  type Category,
  type Transaction,
} from "@/lib/expense-logic";
import {
  formatMoney,
  today,
  type PricePoint,
  type Product,
  type ReceiptSummary,
  type Store,
} from "@/lib/grocery-logic";
import { LOCALE_TAG, useLanguage, useTranslations } from "@/i18n";

import { Button } from "./Button";
import { EmptyState, PageHeader, fill } from "./common";
import { Bar, GroceryStats } from "./GroceryStats";

export type BilanTexts = {
  title: string;
  emptyTitle: string;
  emptyDescription: string;
  previous: string;
  next: string;
  total: string;
  /** `{amount}` = signed difference with the previous month. */
  vsPrevious: string;
  byCategory: string;
  /** `{budget}`. */
  ofBudget: string;
  uncategorized: string;
  methods: string;
  last12: string;
  editBudgets: string;
};

export function BilanView({
  transactions,
  categories,
  receipts,
  points,
  stores,
  products,
}: {
  transactions: Transaction[];
  categories: Category[];
  receipts: ReceiptSummary[];
  points: PricePoint[];
  stores: Store[];
  products: Product[];
}) {
  const messages = useTranslations();
  const t = messages.bilan;
  const tag = LOCALE_TAG[useLanguage().locale];
  const [month, setMonth] = useState(monthOf(today()));

  if (transactions.length === 0) {
    return (
      <>
        <PageHeader title={t.title} />
        <EmptyState title={t.emptyTitle} description={t.emptyDescription} />
      </>
    );
  }

  const summary = summarize(
    transactions.filter((x) => monthOf(x.date) === month),
  );
  const previous = summarize(
    transactions.filter((x) => monthOf(x.date) === shiftMonth(month, -1)),
  ).total;
  const diff = summary.total - previous;
  const rows = [
    ...categories.map((c) => ({
      id: c.id,
      label: `${c.icon} ${categoryLabel(c, messages.categoryNames)}`,
      spent: summary.byCategory.get(c.id) ?? 0,
      budget: c.budget,
    })),
    {
      id: "none",
      label: `❔ ${t.uncategorized}`,
      spent: summary.byCategory.get(null) ?? 0,
      budget: null,
    },
  ]
    .filter((r) => r.spent > 0 || r.budget)
    .sort((a, b) => b.spent - a.spent);
  const maxSpent = Math.max(
    1,
    ...rows.map((r) => Math.max(r.spent, r.budget ?? 0)),
  );
  const months = monthlyTotals(transactions, month, 12);
  const groceries = categories.find((c) => c.key === GROCERIES_KEY)?.id;
  const groceryReceipts = new Set(
    transactions
      .filter((x) => x.receiptId && x.categoryId === groceries)
      .map((x) => x.receiptId),
  );
  const monthMax = Math.max(1, ...months.map((m) => m.total));

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          aria-label={t.previous}
          onClick={() => setMonth(shiftMonth(month, -1))}
        >
          <span className="inline-block rtl:rotate-180">‹</span>
        </Button>
        <h1 className="text-2xl capitalize">
          {t.title} · {formatMonth(month, tag)}
        </h1>
        <Button
          variant="ghost"
          aria-label={t.next}
          onClick={() => setMonth(shiftMonth(month, 1))}
        >
          <span className="inline-block rtl:rotate-180">›</span>
        </Button>
      </div>

      <section className="card mb-6 flex flex-wrap items-end justify-between gap-3 p-4">
        <div>
          <div className="eyebrow">{t.total}</div>
          <div className="num text-3xl font-semibold">
            {formatMoney(summary.total, tag)}
          </div>
          {previous > 0 && (
            <div
              className={`num text-sm ${diff > 0 ? "text-danger" : "text-accent"}`}
            >
              {fill(t.vsPrevious, {
                amount: `${diff > 0 ? "+" : ""}${formatMoney(diff, tag)}`,
              })}
            </div>
          )}
        </div>
        <div className="min-w-48 flex-1 sm:max-w-64">
          <div className="eyebrow mb-1">{t.methods}</div>
          {METHODS.map((m) => (
            <div key={m} className="mb-1 text-sm">
              <div className="flex justify-between">
                <span>
                  {METHOD_ICON[m]} {messages.methods[m]}
                </span>
                <span className="num">
                  {formatMoney(summary.byMethod[m], tag)}
                </span>
              </div>
              <Bar value={summary.byMethod[m]} max={summary.total} />
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        <section className="card p-4">
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <h2 className="text-lg">{t.byCategory}</h2>
            <Link href="/categories" className="text-sm text-accent">
              {t.editBudgets}
            </Link>
          </div>
          <ul className="flex flex-col gap-3 text-sm">
            {rows.map((r) => {
              const state = r.budget ? budgetState(r.spent, r.budget) : "ok";
              return (
                <li key={r.id}>
                  <div className="flex justify-between gap-2">
                    <span className="truncate">{r.label}</span>
                    <span className="num shrink-0">
                      {formatMoney(r.spent, tag)}
                      {r.budget && (
                        <span className="text-xs text-muted">
                          {" "}
                          {fill(t.ofBudget, {
                            budget: formatMoney(r.budget, tag),
                          })}
                        </span>
                      )}
                    </span>
                  </div>
                  <Bar
                    value={r.spent}
                    max={r.budget ?? maxSpent}
                    tone={
                      state === "over"
                        ? "danger"
                        : state === "near"
                          ? "warn"
                          : "accent"
                    }
                  />
                </li>
              );
            })}
          </ul>
        </section>

        <section className="card p-4">
          <h2 className="mb-3 text-lg">{t.last12}</h2>
          <ul className="flex flex-col gap-2 text-sm">
            {[...months].reverse().map((m) => (
              <li key={m.month}>
                <div className="flex justify-between">
                  <span className="capitalize">
                    {formatMonth(m.month, tag)}
                  </span>
                  <span className="num">{formatMoney(m.total, tag)}</span>
                </div>
                <Bar value={m.total} max={monthMax} />
              </li>
            ))}
          </ul>
        </section>
      </div>

      <GroceryStats
        receipts={receipts.filter((r) => groceryReceipts.has(r.id))}
        points={points.filter((p) => groceryReceipts.has(p.receiptId))}
        stores={stores}
        products={products}
      />
    </>
  );
}
