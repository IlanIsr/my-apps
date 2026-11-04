"use client";

/**
 * The receipt list, newest first, grouped by month (with each month's total),
 * filterable by store, under this month's groceries spending (against its
 * budget, with the month-end projection). Each row says whether the computed
 * sum matches the total printed on the receipt. A friend's receipt (prices
 * only, not an expense) is hidden unless asked for, marked, and left out of
 * the month totals.
 */

import Link from "next/link";
import { useState } from "react";

import {
  checkTotal,
  formatDay,
  formatMoney,
  type ReceiptSummary,
  type Store,
} from "@/lib/grocery-logic";
import { LOCALE_TAG, useLanguage, useTranslations } from "@/i18n";

import { Checkbox } from "./Checkbox";
import { EmptyState, LinkButton, PageHeader, fill } from "./common";
import { Bar } from "./GroceryStats";
import { Select } from "./Select";

export type ReceiptsTexts = {
  title: string;
  add: string;
  allStores: string;
  store: string;
  emptyTitle: string;
  emptyDescription: string;
  /** `{n}` = number of lines. */
  lineCount: string;
  matches: string;
  mismatch: string;
  monthSpent: string;
  /** `{budget}`. */
  ofBudget: string;
  /** `{amount}`. */
  projection: string;
  setBudget: string;
  /** A friend's receipt (not an expense). */
  friend: string;
  /** `{n}` friends' receipts. */
  showFriends: string;
};

/** This month's spending in Groceries. */
export type GroceriesMonth = {
  spent: number;
  budget: number | null;
  projection: number | null;
};

export function CheckBadge({
  receipt,
  t,
}: {
  /** `total` = what was paid (cash already rounded). */
  receipt: { total: number; declaredTotal: number | null };
  t: { matches: string; mismatch: string };
}) {
  const check = checkTotal(receipt.total, receipt.declaredTotal);
  if (check === "none") return null;
  const ok = check === "match";
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        ok ? "bg-accent-soft text-accent" : "bg-danger-soft text-danger"
      }`}
    >
      {ok ? `✓ ${t.matches}` : `≠ ${t.mismatch}`}
    </span>
  );
}

export function ReceiptsView({
  receipts,
  stores,
  month,
}: {
  receipts: ReceiptSummary[];
  stores: Store[];
  month: GroceriesMonth;
}) {
  const t = useTranslations().receipts;
  const tag = LOCALE_TAG[useLanguage().locale];
  const [storeId, setStoreId] = useState("all");
  const [showFriends, setShowFriends] = useState(false);
  const friends = receipts.filter((r) => r.fromFriend).length;

  const shown = receipts.filter(
    (r) =>
      (storeId === "all" || r.storeId === storeId) &&
      (showFriends || !r.fromFriend),
  );
  const months = new Map<string, ReceiptSummary[]>();
  for (const r of shown) {
    const key = r.date.slice(0, 7);
    months.set(key, [...(months.get(key) ?? []), r]);
  }

  return (
    <>
      <PageHeader title={t.title}>
        <LinkButton href="/receipts/new" variant="primary">
          + {t.add}
        </LinkButton>
      </PageHeader>

      {receipts.length === 0 ? (
        <EmptyState title={t.emptyTitle} description={t.emptyDescription}>
          <LinkButton href="/receipts/new" variant="primary">
            + {t.add}
          </LinkButton>
        </EmptyState>
      ) : (
        <>
          <section className="card mb-4 p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="eyebrow">🛒 {t.monthSpent}</span>
              <span className="num text-sm">
                <span className="text-lg font-semibold">
                  {formatMoney(month.spent, tag)}
                </span>
                {month.budget && (
                  <span className="text-muted">
                    {" "}
                    {fill(t.ofBudget, {
                      budget: formatMoney(month.budget, tag),
                    })}
                  </span>
                )}
              </span>
            </div>
            {month.budget && (
              <div className="mt-2">
                <Bar
                  value={month.spent}
                  max={month.budget}
                  tone={
                    month.spent > month.budget
                      ? "danger"
                      : month.spent >= month.budget * 0.8
                        ? "warn"
                        : "accent"
                  }
                />
              </div>
            )}
            <div className="mt-1 flex flex-wrap justify-between gap-2 text-xs text-muted">
              <span className="num">
                {month.projection !== null &&
                  fill(t.projection, {
                    amount: formatMoney(month.projection, tag),
                  })}
              </span>
              {!month.budget && (
                <Link href="/categories" className="text-accent">
                  {t.setBudget}
                </Link>
              )}
            </div>
          </section>
          <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            {stores.length > 1 && (
              <Select
                aria-label={t.store}
                className="w-56"
                value={storeId}
                onChange={setStoreId}
                options={[
                  { key: "all", label: t.allStores },
                  ...stores.map((s) => ({ key: s.id, label: s.name })),
                ]}
              />
            )}
            {friends > 0 && (
              <Checkbox
                checked={showFriends}
                onChange={setShowFriends}
                className="flex items-center gap-2 text-sm"
              >
                👥 {fill(t.showFriends, { n: friends })}
              </Checkbox>
            )}
          </div>
          <div className="flex flex-col gap-6">
            {[...months].map(([month, list]) => (
              <section key={month}>
                <div className="mb-2 flex items-baseline justify-between">
                  <h2 className="text-lg capitalize">
                    {new Date(`${month}-15T12:00:00`).toLocaleDateString(tag, {
                      month: "long",
                      year: "numeric",
                    })}
                  </h2>
                  <span className="num text-sm text-muted">
                    {formatMoney(
                      list.reduce(
                        (s, r) => s + (r.fromFriend ? 0 : r.total),
                        0,
                      ),
                      tag,
                    )}
                  </span>
                </div>
                <ul className="card divide-y divide-line">
                  {list.map((r) => (
                    <li key={r.id}>
                      <Link
                        href={`/receipts/${r.id}`}
                        className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 hover:bg-sunken"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block font-medium">
                            {r.storeName}
                          </span>
                          <span className="text-xs text-muted">
                            {formatDay(r.date, tag)} ·{" "}
                            {fill(t.lineCount, { n: r.lineCount })}
                          </span>
                        </span>
                        {r.fromFriend && (
                          <span className="rounded-full bg-sunken px-2 py-0.5 text-xs text-muted">
                            👥 {t.friend}
                          </span>
                        )}
                        <CheckBadge receipt={r} t={t} />
                        <span
                          className={`num font-semibold ${
                            r.fromFriend ? "text-muted" : ""
                          }`}
                        >
                          {formatMoney(r.total, tag)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}
    </>
  );
}
