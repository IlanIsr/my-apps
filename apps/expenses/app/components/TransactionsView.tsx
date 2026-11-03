"use client";

/**
 * The home page: one month of expenses (‹ month ›), its total and cash / card
 * split, budget alerts, filters, and the list grouped by day. The round "+"
 * opens the quick add; tapping a line edits it.
 */

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  budgetState,
  categoryLabel,
  formatMonth,
  METHOD_ICON,
  METHODS,
  monthOf,
  projectMonth,
  shiftMonth,
  summarize,
  type Category,
  type CategoryRules,
  type Goal,
  type Method,
  type Transaction,
} from "@/lib/expense-logic";
import {
  formatDay,
  formatMoney,
  quantityToInput,
  today,
} from "@/lib/grocery-logic";
import { LOCALE_TAG, useLanguage, useTranslations } from "@/i18n";

import { Button } from "./Button";
import { GoalCard } from "./GoalCard";
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
  goals: string;
  seeGoals: string;
  /** `{liters}`, `{price}` = per litre. */
  perLiter: string;
  /** `{amount}` = the month's total at the current pace. */
  projection: string;
};

export function TransactionsView({
  transactions,
  categories,
  rules,
  goals,
}: {
  transactions: Transaction[];
  categories: Category[];
  rules: CategoryRules;
  goals: Goal[];
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
  const monthGoals = goals.filter((g) => g.month === month);
  const summary = summarize(inMonth);
  const projection = projectMonth(summary.total, month, today());
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
          <span aria-hidden>‹</span>
        </Button>
        <h1 className="text-2xl capitalize">{formatMonth(month, tag)}</h1>
        <Button
          variant="ghost"
          aria-label={t.next}
          onClick={() => setMonth(shiftMonth(month, 1))}
        >
          <span aria-hidden>›</span>
        </Button>
      </div>

      <section className="card mb-4 overflow-hidden !p-0">
        <div className="flex flex-col gap-2 p-5">
          <div className="eyebrow">{t.total}</div>
          <div className="num text-4xl leading-none font-semibold tracking-tight">
            {formatMoney(summary.total, tag)}
          </div>
          {projection !== null && (
            <span className="num w-fit rounded-full bg-sunken px-2.5 py-1 text-xs text-muted">
              {fill(t.projection, { amount: formatMoney(projection, tag) })}
            </span>
          )}
          {/* How the month splits between payment methods. */}
          <div className="mt-2 flex h-1.5 w-full gap-0.5 overflow-hidden rounded-full bg-sunken">
            {summary.total > 0 &&
              METHODS.filter((m) => summary.byMethod[m] > 0).map((m) => (
                <div
                  key={m}
                  className="h-full"
                  style={{
                    width: `${(summary.byMethod[m] / summary.total) * 100}%`,
                    background: `var(--pay-${m})`,
                  }}
                />
              ))}
          </div>
        </div>
        <ul className="grid grid-cols-3 divide-x divide-line border-t border-line rtl:divide-x-reverse">
          {METHODS.map((m) => (
            <li key={m} className="flex min-w-0 flex-col gap-0.5 px-5 py-3">
              <span className="flex items-center gap-1.5 truncate text-xs text-muted">
                <span
                  aria-hidden
                  className="size-2 shrink-0 rounded-full"
                  style={{ background: `var(--pay-${m})` }}
                />
                {messages.methods[m]}
              </span>
              <span
                className={`num truncate font-semibold ${
                  summary.byMethod[m] ? "" : "text-muted"
                }`}
              >
                {formatMoney(summary.byMethod[m], tag)}
              </span>
            </li>
          ))}
        </ul>
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

      {monthGoals.length > 0 && (
        <section className="card mb-4 flex flex-col gap-3 p-4">
          <div className="flex items-baseline justify-between gap-2">
            <span className="eyebrow">🎯 {t.goals}</span>
            <Link href="/goals" className="text-sm text-accent">
              {t.seeGoals}
            </Link>
          </div>
          {monthGoals.map((g) => (
            <GoalCard
              key={g.id}
              goal={g}
              transactions={transactions}
              categories={categories}
              compact
            />
          ))}
        </section>
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
                            {x.litersMilli &&
                              x.pricePerLiter &&
                              ` · ${fill(t.perLiter, {
                                liters: quantityToInput(x.litersMilli),
                                price: formatMoney(x.pricePerLiter, tag),
                              })}`}
                            {x.items &&
                              ` · ${x.items.map((i) => i.label).join(", ")}`}
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
