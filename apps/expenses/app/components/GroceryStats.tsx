"use client";

/**
 * The groceries part of the Bilan: receipt spending per month, per store, the
 * products that cost the most overall, and the prices that rose the most.
 * Renders nothing until there's a receipt.
 */

import Link from "next/link";

import {
  formatMoney,
  priceChanges,
  spendingByMonth,
  spendingByProduct,
  spendingByStore,
  type PricePoint,
  type Product,
  type ReceiptSummary,
  type Store,
} from "@/lib/grocery-logic";
import { LOCALE_TAG, useLanguage, useTranslations } from "@/i18n";

import { fill } from "./common";

export type StatsTexts = {
  title: string;
  byMonth: string;
  byStore: string;
  topProducts: string;
  priceRises: string;
  noRises: string;
  /** `{n}`. */
  receiptCount: string;
  /** `{store}`. */
  atStore: string;
};

export function Bar({
  value,
  max,
  tone = "accent",
}: {
  value: number;
  max: number;
  tone?: "accent" | "warn" | "danger";
}) {
  return (
    <div className="h-2 w-full rounded-full bg-sunken">
      <div
        className={`h-2 rounded-full ${tone === "danger" ? "bg-danger" : tone === "warn" ? "bg-warn" : "bg-accent"}`}
        style={{
          width: `${max > 0 ? Math.min(100, Math.max(2, (value / max) * 100)) : 0}%`,
        }}
      />
    </div>
  );
}

export function GroceryStats({
  receipts,
  points,
  stores,
  products,
}: {
  receipts: ReceiptSummary[];
  points: PricePoint[];
  stores: Store[];
  products: Product[];
}) {
  const t = useTranslations().stats;
  const tag = LOCALE_TAG[useLanguage().locale];

  if (receipts.length === 0) return null;

  const storeName = new Map(stores.map((s) => [s.id, s.name]));
  const productName = new Map(products.map((p) => [p.id, p.name]));
  const months = spendingByMonth(receipts).slice(0, 12);
  const byStore = spendingByStore(receipts);
  const top = spendingByProduct(points).slice(0, 10);
  const rises = priceChanges(points)
    .filter((c) => c.pct > 0)
    .slice(0, 8);
  const monthMax = Math.max(...months.map((m) => m.total));
  const storeMax = byStore[0]?.total ?? 0;
  const topMax = top[0]?.total ?? 0;

  return (
    <section className="mt-10">
      <h2 className="mb-4 text-2xl">🛒 {t.title}</h2>
      <div className="grid gap-6 sm:grid-cols-2">
        <section className="card p-4">
          <h2 className="mb-3 text-lg">{t.byMonth}</h2>
          <ul className="flex flex-col gap-2 text-sm">
            {months.map((m) => (
              <li key={m.month}>
                <div className="flex justify-between">
                  <span className="capitalize">
                    {new Date(`${m.month}-15T12:00:00`).toLocaleDateString(
                      tag,
                      {
                        month: "long",
                        year: "numeric",
                      },
                    )}
                  </span>
                  <span className="num">{formatMoney(m.total, tag)}</span>
                </div>
                <Bar value={m.total} max={monthMax} />
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-4">
          <h2 className="mb-3 text-lg">{t.byStore}</h2>
          <ul className="flex flex-col gap-2 text-sm">
            {byStore.map((s) => (
              <li key={s.storeId}>
                <div className="flex justify-between gap-2">
                  <span className="truncate">
                    {storeName.get(s.storeId)}{" "}
                    <span className="text-xs text-muted">
                      {fill(t.receiptCount, { n: s.count })}
                    </span>
                  </span>
                  <span className="num">{formatMoney(s.total, tag)}</span>
                </div>
                <Bar value={s.total} max={storeMax} />
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-4">
          <h2 className="mb-3 text-lg">{t.topProducts}</h2>
          <ul className="flex flex-col gap-2 text-sm">
            {top.map((p) => (
              <li key={p.productId}>
                <div className="flex justify-between gap-2">
                  <Link
                    href={`/products/${p.productId}`}
                    className="truncate hover:underline"
                  >
                    {productName.get(p.productId)}
                  </Link>
                  <span className="num">{formatMoney(p.total, tag)}</span>
                </div>
                <Bar value={p.total} max={topMax} />
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-4">
          <h2 className="mb-3 text-lg">{t.priceRises}</h2>
          {rises.length === 0 ? (
            <p className="text-sm text-muted">{t.noRises}</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {rises.map((c) => (
                <li
                  key={`${c.productId}|${c.storeId}`}
                  className="flex justify-between gap-2"
                >
                  <Link
                    href={`/products/${c.productId}`}
                    className="min-w-0 hover:underline"
                  >
                    <span className="block truncate">
                      {productName.get(c.productId)}
                    </span>
                    <span className="text-xs text-muted">
                      {fill(t.atStore, {
                        store: storeName.get(c.storeId) ?? "",
                      })}
                    </span>
                  </Link>
                  <span className="num shrink-0 text-end">
                    <span className="block font-medium text-danger">
                      +{c.pct}%
                    </span>
                    <span className="text-xs text-muted">
                      {formatMoney(c.from, tag)} → {formatMoney(c.to, tag)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </section>
  );
}
