"use client";

/**
 * The receipt list, newest first, grouped by month (with each month's total),
 * filterable by store. Each row says whether the computed sum matches the
 * total printed on the receipt.
 */

import Link from "next/link";
import { useState } from "react";

import {
  formatDay,
  formatMoney,
  type ReceiptSummary,
  type Store,
} from "@/lib/grocery-logic";
import { LOCALE_TAG, useLanguage, useTranslations } from "@/i18n";

import { EmptyState, LinkButton, PageHeader, fill } from "./common";
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
};

export function CheckBadge({
  receipt,
  t,
}: {
  receipt: { total: number; declaredTotal: number | null };
  t: { matches: string; mismatch: string };
}) {
  if (receipt.declaredTotal === null) return null;
  const ok = receipt.declaredTotal === receipt.total;
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
}: {
  receipts: ReceiptSummary[];
  stores: Store[];
}) {
  const t = useTranslations().receipts;
  const tag = LOCALE_TAG[useLanguage().locale];
  const [storeId, setStoreId] = useState("all");

  const shown =
    storeId === "all"
      ? receipts
      : receipts.filter((r) => r.storeId === storeId);
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
          {stores.length > 1 && (
            <Select
              aria-label={t.store}
              className="mb-4 w-56"
              value={storeId}
              onChange={setStoreId}
              options={[
                { key: "all", label: t.allStores },
                ...stores.map((s) => ({ key: s.id, label: s.name })),
              ]}
            />
          )}
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
                      list.reduce((s, r) => s + r.total, 0),
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
                        <CheckBadge receipt={r} t={t} />
                        <span className="num font-semibold">
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
