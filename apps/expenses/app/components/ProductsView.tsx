"use client";

/**
 * Every product bought so far, searchable by name or barcode. Filtered on one
 * store, it lists what was bought there with its last price; otherwise each
 * product shows its cheapest store.
 */

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  cheapest,
  formatDay,
  formatMoney,
  latestPrices,
  normalizeName,
  type PricePoint,
  type Product,
  type Store,
} from "@/lib/grocery-logic";
import { LOCALE_TAG, useLanguage, useTranslations } from "@/i18n";

import { EmptyState, LinkButton, PageHeader, fill } from "./common";
import { Select } from "./Select";
import { ShoppingToggle } from "./ShoppingToggle";
import { TextInput } from "./TextInput";

export type ProductsTexts = {
  title: string;
  stores: string;
  search: string;
  allStores: string;
  store: string;
  emptyTitle: string;
  emptyDescription: string;
  noMatch: string;
  /** `{store}`. */
  cheapestAt: string;
  /** `{date}`. */
  lastBought: string;
  perKg: string;
  /** `{n}`. */
  count: string;
};

export function ProductsView({
  products,
  stores,
  points,
  shoppingIds,
  initialStoreId,
}: {
  products: Product[];
  stores: Store[];
  points: PricePoint[];
  shoppingIds: string[];
  initialStoreId: string | null;
}) {
  const messages = useTranslations();
  const t = messages.products;
  const tag = LOCALE_TAG[useLanguage().locale];
  const [query, setQuery] = useState("");
  const [storeId, setStoreId] = useState(initialStoreId ?? "all");

  const prices = useMemo(() => latestPrices(points), [points]);
  const storeName = new Map(stores.map((s) => [s.id, s.name]));
  const inList = new Set(shoppingIds);

  const q = normalizeName(query);
  const shown = products.filter((p) => {
    if (storeId !== "all" && !prices.get(p.id)?.has(storeId)) return false;
    if (!q) return true;
    return normalizeName(p.name).includes(q) || p.barcode?.includes(q.trim());
  });

  if (products.length === 0) {
    return (
      <>
        <PageHeader title={t.title} />
        <EmptyState title={t.emptyTitle} description={t.emptyDescription} />
      </>
    );
  }

  return (
    <>
      <PageHeader title={t.title}>
        <LinkButton href="/stores" size="sm">
          🏪 {t.stores}
        </LinkButton>
      </PageHeader>
      <div className="mb-4 flex flex-wrap gap-2">
        <TextInput
          aria-label={t.search}
          placeholder={t.search}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-w-0 flex-1"
        />
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
      </div>
      <p className="mb-2 text-xs text-muted">
        {fill(t.count, { n: shown.length })}
      </p>

      {shown.length === 0 ? (
        <p className="text-muted">{t.noMatch}</p>
      ) : (
        <ul className="card divide-y divide-line">
          {shown.map((p) => {
            const byStore = prices.get(p.id);
            const point =
              storeId === "all" ? cheapest(byStore) : byStore?.get(storeId);
            return (
              <li
                key={p.id}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3"
              >
                <Link
                  href={`/products/${p.id}`}
                  className="min-w-0 flex-1 hover:underline"
                >
                  <span className="block font-medium">{p.name}</span>
                  <span className="text-xs text-muted">
                    {point &&
                      (storeId === "all"
                        ? fill(t.cheapestAt, {
                            store: storeName.get(point.storeId) ?? "",
                          })
                        : fill(t.lastBought, {
                            date: formatDay(point.date, tag),
                          }))}
                    {p.barcode && <span className="num"> · {p.barcode}</span>}
                  </span>
                </Link>
                {point && (
                  <span className="num font-semibold">
                    {formatMoney(point.unitPrice, tag)}
                    {p.unit === "kg" && (
                      <span className="text-xs text-muted">{t.perKg}</span>
                    )}
                  </span>
                )}
                <ShoppingToggle
                  productId={p.id}
                  inList={inList.has(p.id)}
                  t={messages.shoppingToggle}
                />
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
