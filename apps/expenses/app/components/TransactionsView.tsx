"use client";

/**
 * The home page: one month of expenses (‹ month ›), its total and cash / card
 * split, budget alerts, filters, and the list grouped by day. The round "+"
 * opens the quick add; tapping a line edits it.
 */

import { useMemo, useState } from "react";

import {
  budgetState,
  categoryLabel,
  formatMonth,
  METHOD_ICON,
  METHODS,
  monthOf,
  shiftMonth,
  summarize,
  type Category,
  type CategoryRules,
  type Method,
  type Transaction,
} from "@/lib/expense-logic";
import { formatDay, formatMoney, today } from "@/lib/grocery-logic";
import { LOCALE_TAG, useLanguage, useTranslations } from "@/i18n";

import { Button } from "./Button";
import { EmptyState, LinkButton, fill } from "./common";
import { Select } from "./Select";
import { TransactionModal } from "./TransactionModal";

export type TransactionsTexts = {
  title: string;
  add: string;
  previous: string;
  next: string;
  total: string;
  allCategories: string;
  allMethods: string;
  uncategorized: string;
  emptyTitle: string;
  emptyDescription: string;
  noMatch: string;
  receipt: string;
  importStatement: string;
  /** `{category}`, `{spent}`, `{budget}`. */
  budgetNear: string;
  budgetOver: string;
};

export function TransactionsView({
  transactions,
  categories,
  rules,
}: {
  transactions: Transaction[];
  categories: Category[];
  rules: CategoryRules;
}) {
  const messages = useTranslations();
  const t = messages.transactions;
  const tag = LOCALE_TAG[useLanguage().locale];

  const [month, setMonth] = useState(monthOf(today()));
  const [categoryId, setCategoryId] = useState("all");
  const [method, setMethod] = useState<"all" | Method>("all");
  const [editing, setEditing] = useState<Transaction | "new" | null>(null);

  const byId = new Map(categories.map((c) => [c.id, c]));
  const merchants = useMemo(
    () =>
      [
        ...new Set(transactions.map((x) => x.merchant).filter(Boolean)),
      ].sort() as string[],
    [transactions],
  );

  const inMonth = transactions.filter((x) => monthOf(x.date) === month);
  const summary = summarize(inMonth);
  const shown = inMonth.filter(
    (x) =>
      (categoryId === "all" ||
        (categoryId === "none"
          ? !x.categoryId
          : x.categoryId === categoryId)) &&
      (method === "all" || x.method === method),
  );
  const days = new Map<string, Transaction[]>();
  for (const x of shown) days.set(x.date, [...(days.get(x.date) ?? []), x]);

  const alerts = categories
    .filter((c) => c.budget)
    .map((c) => {
      const spent = summary.byCategory.get(c.id) ?? 0;
      return { c, spent, state: budgetState(spent, c.budget!) };
    })
    .filter((a) => a.state !== "ok");

  const label = (c: Category) => categoryLabel(c, messages.categoryNames);

  return (
    <div className="pb-24">
      <div className="mb-4 flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          aria-label={t.previous}
          onClick={() => setMonth(shiftMonth(month, -1))}
        >
          <span className="inline-block rtl:rotate-180">‹</span>
        </Button>
        <h1 className="text-2xl capitalize">{formatMonth(month, tag)}</h1>
        <Button
          variant="ghost"
          aria-label={t.next}
          onClick={() => setMonth(shiftMonth(month, 1))}
        >
          <span className="inline-block rtl:rotate-180">›</span>
        </Button>
      </div>

      <section className="card mb-4 flex flex-wrap items-end justify-between gap-3 p-4">
        <div>
          <div className="eyebrow">{t.total}</div>
          <div className="num text-3xl font-semibold">
            {formatMoney(summary.total, tag)}
          </div>
        </div>
        <div className="num flex gap-4 text-sm text-muted">
          {METHODS.map((m) => (
            <span key={m} className="flex flex-col items-end">
              <span className="text-xs">
                {METHOD_ICON[m]} {messages.methods[m]}
              </span>
              <span className="text-foreground">
                {formatMoney(summary.byMethod[m], tag)}
              </span>
            </span>
          ))}
        </div>
      </section>

      {alerts.length > 0 && (
        <ul className="mb-4 flex flex-col gap-1.5">
          {alerts.map(({ c, spent, state }) => (
            <li
              key={c.id}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                state === "over"
                  ? "bg-danger-soft text-danger"
                  : "bg-warn-soft text-warn"
              }`}
            >
              {c.icon}{" "}
              {fill(state === "over" ? t.budgetOver : t.budgetNear, {
                category: label(c),
                spent: formatMoney(spent, tag),
                budget: formatMoney(c.budget!, tag),
              })}
            </li>
          ))}
        </ul>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        <Select
          aria-label={t.allCategories}
          className="w-48"
          value={categoryId}
          onChange={setCategoryId}
          options={[
            { key: "all", label: t.allCategories },
            ...categories.map((c) => ({
              key: c.id,
              label: `${c.icon} ${label(c)}`,
            })),
            { key: "none", label: t.uncategorized },
          ]}
        />
        <Select
          aria-label={t.allMethods}
          className="w-40"
          value={method}
          onChange={(v) => setMethod(v as "all" | Method)}
          options={[
            { key: "all", label: t.allMethods },
            ...METHODS.map((m) => ({
              key: m,
              label: `${METHOD_ICON[m]} ${messages.methods[m]}`,
            })),
          ]}
        />
        <div className="flex w-full flex-wrap gap-2 sm:ms-auto sm:w-auto">
          <LinkButton href="/receipts/new" size="sm">
            🧾 {t.receipt}
          </LinkButton>
          <LinkButton href="/import" size="sm">
            {t.importStatement}
          </LinkButton>
        </div>
      </div>

      {transactions.length === 0 ? (
        <EmptyState title={t.emptyTitle} description={t.emptyDescription} />
      ) : shown.length === 0 ? (
        <p className="text-muted">{t.noMatch}</p>
      ) : (
        <div className="flex flex-col gap-4">
          {[...days].map(([day, list]) => (
            <section key={day}>
              <div className="mb-1 flex justify-between text-xs text-muted">
                <span>{formatDay(day, tag)}</span>
                <span className="num">
                  {formatMoney(
                    list.reduce((s, x) => s + x.amount, 0),
                    tag,
                  )}
                </span>
              </div>
              <ul className="card divide-y divide-line">
                {list.map((x) => {
                  const c = x.categoryId ? byId.get(x.categoryId) : null;
                  return (
                    <li key={x.id}>
                      <Button
                        variant="ghost"
                        onClick={() => setEditing(x)}
                        className="h-auto w-full justify-start gap-3 rounded-none px-4 py-3 text-start font-normal text-foreground"
                      >
                        <span aria-hidden className="text-xl">
                          {c?.icon ?? "❔"}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">
                            {x.merchant ?? (c ? label(c) : t.uncategorized)}
                          </span>
                          <span className="block truncate text-xs text-muted">
                            {c ? label(c) : t.uncategorized}
                            {x.receiptId && " · 🧾"}
                            {x.note && ` · ${x.note}`}
                          </span>
                        </span>
                        <span aria-hidden className="text-sm">
                          {METHOD_ICON[x.method]}
                        </span>
                        <span className="num font-semibold">
                          {formatMoney(x.amount, tag)}
                        </span>
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

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

      {editing && (
        <TransactionModal
          transaction={editing === "new" ? null : editing}
          categories={categories}
          rules={rules}
          merchants={merchants}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
