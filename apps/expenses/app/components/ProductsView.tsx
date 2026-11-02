"use client";

/**
 * Every product bought so far, searchable by name or barcode, filterable by
 * shelf. Filtered on one store, it lists what was bought there with its last
 * price; otherwise each product shows its cheapest store. Sorting by price
 * per L / kg compares different formats (all the milks…). Links to the
 * Duplicates page when there are suggestions.
 */

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  AISLE_ICON,
  AISLES,
  cheapest,
  duplicateSuggestions,
  formatDay,
  formatMoney,
  latestPrices,
  normalizeName,
  pricePerMeasure,
  type Aisle,
  type PricePoint,
  type Product,
  type Store,
} from "@/lib/grocery-logic";
import { LOCALE_TAG, useLanguage, useTranslations } from "@/i18n";

import { EmptyState, LinkButton, PageHeader, fill } from "./common";
import { measureLabel } from "./ProductView";
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
  aisle: string;
  allAisles: string;
  sort: string;
  sortName: string;
  sortMeasure: string;
  /** `{n}` suggestions. */
  duplicates: string;
};

export function ProductsView({
  products,
  stores,
  points,
  shoppingIds,
  initialStoreId,
  distinctPairs,
}: {
  products: Product[];
  stores: Store[];
  points: PricePoint[];
  shoppingIds: string[];
  initialStoreId: string | null;
  distinctPairs: string[];
}) {
  const messages = useTranslations();
  const t = messages.products;
  const tag = LOCALE_TAG[useLanguage().locale];
  const [query, setQuery] = useState("");
  const [storeId, setStoreId] = useState(initialStoreId ?? "all");
  const [aisle, setAisle] = useState<Aisle | "all">("all");
  const [sort, setSort] = useState<"name" | "measure">("name");
  const duplicates = useMemo(
    () => duplicateSuggestions(products, new Set(distinctPairs)).length,
    [products, distinctPairs],
  );

  const prices = useMemo(() => latestPrices(points), [points]);
  const storeName = new Map(stores.map((s) => [s.id, s.name]));
  const inList = new Set(shoppingIds);

  const q = normalizeName(query);
  const pointOf = (p: Product) => {
    const byStore = prices.get(p.id);
    return storeId === "all" ? cheapest(byStore) : byStore?.get(storeId);
  };
  const filtered = products.filter((p) => {
    if (storeId !== "all" && !prices.get(p.id)?.has(storeId)) return false;
    if (aisle !== "all" && p.aisle !== aisle) return false;
    if (!q) return true;
    return normalizeName(p.name).includes(q) || p.barcode?.includes(q.trim());
  });
  // Price per L / kg, cheapest first; unknown ones last.
  const measureOf = (p: Product) => {
    const point = pointOf(p);
    return (point && pricePerMeasure(p, point.unitPrice)?.price) ?? Infinity;
  };
  const shown =
    sort === "measure"
      ? [...filtered].sort((a, b) => measureOf(a) - measureOf(b))
      : filtered;

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
        {duplicates > 0 && (
          <LinkButton href="/products/duplicates" size="sm">
            {fill(t.duplicates, { n: duplicates })}
          </LinkButton>
        )}
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
        <Select
          aria-label={t.aisle}
          className="w-48"
          value={aisle}
          onChange={(v) => setAisle(v as Aisle | "all")}
          options={[
            { key: "all", label: t.allAisles },
            ...AISLES.map((a) => ({
              key: a,
              label: `${AISLE_ICON[a]} ${messages.aisles[a]}`,
            })),
          ]}
        />
        <Select
          aria-label={t.sort}
          className="w-44"
          value={sort}
          onChange={(v) => setSort(v as "name" | "measure")}
          options={[
            { key: "name", label: t.sortName },
            { key: "measure", label: t.sortMeasure },
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
            const point = pointOf(p);
            const measure =
              point &&
              measureLabel(
                p,
                point.unitPrice,
                tag,
                messages.product.contentUnits,
              );
            return (
              <li
                key={p.id}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3"
              >
                <Link
                  href={`/products/${p.id}`}
                  className="min-w-0 flex-1 hover:underline"
                >
                  <span className="block font-medium">
                    {p.aisle && (
                      <span aria-hidden className="me-1">
                        {AISLE_ICON[p.aisle]}
                      </span>
                    )}
                    {p.name}
                  </span>
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
                  <span className="num text-end font-semibold">
                    {formatMoney(point.unitPrice, tag)}
                    {p.unit === "kg" && (
                      <span className="text-xs text-muted">{t.perKg}</span>
                    )}
                    {measure && (
                      <span className="block text-xs font-normal text-muted">
                        {measure}
                      </span>
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
