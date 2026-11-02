"use client";

/**
 * The shopping list and where to buy it: each store's total for the list
 * (from the last price paid there), complete stores first, cheapest first —
 * plus the "split" plan, each item at its cheapest store, and what it saves.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { clearShoppingAction, setShoppingItemAction } from "@/app/actions";
import {
  formatMoney,
  latestPrices,
  parseQuantity,
  planShopping,
  quantityToInput,
  type PricePoint,
  type Product,
  type ShoppingItem,
  type Store,
} from "@/lib/grocery-logic";
import { LOCALE_TAG, useLanguage, useTranslations } from "@/i18n";

import { Button } from "./Button";
import { Combo } from "./Combo";
import { EmptyState, ErrorLine, PageHeader, fill } from "./common";
import { TextInput } from "./TextInput";

export type ShoppingTexts = {
  title: string;
  add: string;
  addPlaceholder: string;
  clear: string;
  emptyTitle: string;
  emptyDescription: string;
  quantity: string;
  kg: string;
  remove: string;
  whereTitle: string;
  best: string;
  /** `{n}`. */
  missing: string;
  complete: string;
  noStores: string;
  splitTitle: string;
  /** `{amount}`. */
  splitSaves: string;
  splitNoGain: string;
  /** `{names}`. */
  unpriced: string;
};

export function ShoppingView({
  items,
  products,
  stores,
  points,
}: {
  items: ShoppingItem[];
  products: Product[];
  stores: Store[];
  points: PricePoint[];
}) {
  const messages = useTranslations();
  const t = messages.shopping;
  const tag = LOCALE_TAG[useLanguage().locale];
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const productById = new Map(products.map((p) => [p.id, p]));
  const storeName = new Map(stores.map((s) => [s.id, s.name]));
  const prices = useMemo(() => latestPrices(points), [points]);
  const plan = planShopping(items, stores, prices);
  const listed = new Set(items.map((i) => i.productId));

  async function act(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setBusy(true);
    setError(null);
    const result = await fn();
    setBusy(false);
    if (!result.ok) {
      setError(messages.errors[result.error as keyof typeof messages.errors]);
      return;
    }
    router.refresh();
  }

  const setQuantity = (productId: string, text: string) => {
    const milli = parseQuantity(text);
    if (milli === null) return;
    void act(() => setShoppingItemAction(productId, milli));
  };

  const best = plan.quotes[0];
  const bestComplete = best && best.missing.length === 0 ? best : null;

  return (
    <>
      <PageHeader title={t.title}>
        {items.length > 0 && (
          <Button
            variant="ghost"
            disabled={busy}
            onClick={() => act(clearShoppingAction)}
          >
            {t.clear}
          </Button>
        )}
      </PageHeader>

      <div className="mb-4 flex flex-col gap-1">
        <Combo
          aria-label={t.add}
          placeholder={t.addPlaceholder}
          value={query}
          onChange={setQuery}
          options={products
            .filter((p) => !listed.has(p.id))
            .map((p) => ({ key: p.id, label: p.name }))}
          onPick={(id) => {
            setQuery("");
            void act(() => setShoppingItemAction(id, 1000));
          }}
        />
        <ErrorLine message={error} />
      </div>

      {items.length === 0 ? (
        <EmptyState title={t.emptyTitle} description={t.emptyDescription} />
      ) : (
        <>
          <ul className="card mb-8 divide-y divide-line">
            {items.map((item) => {
              const product = productById.get(item.productId);
              if (!product) return null;
              return (
                <li
                  key={item.productId}
                  className="flex items-center gap-3 px-4 py-2"
                >
                  <Link
                    href={`/products/${product.id}`}
                    className="min-w-0 flex-1 truncate hover:underline"
                  >
                    {product.name}
                  </Link>
                  <TextInput
                    aria-label={t.quantity}
                    inputMode="decimal"
                    className="num w-20"
                    value={
                      drafts[item.productId] ??
                      quantityToInput(item.quantityMilli)
                    }
                    onChange={(e) =>
                      setDrafts((d) => ({
                        ...d,
                        [item.productId]: e.target.value,
                      }))
                    }
                    onBlur={(e) => setQuantity(item.productId, e.target.value)}
                  />
                  <span className="w-6 text-xs text-muted">
                    {product.unit === "kg" ? t.kg : ""}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={t.remove}
                    disabled={busy}
                    onClick={() =>
                      act(() => setShoppingItemAction(item.productId, 0))
                    }
                  >
                    ✕
                  </Button>
                </li>
              );
            })}
          </ul>

          <section className="mb-8">
            <h2 className="mb-3 text-lg">{t.whereTitle}</h2>
            {plan.quotes.length === 0 ? (
              <p className="text-muted">{t.noStores}</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {plan.quotes.map((quote) => {
                  const isBest = quote === bestComplete;
                  return (
                    <li
                      key={quote.storeId}
                      className={`card flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 ${
                        isBest ? "border-accent" : ""
                      }`}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium">
                          {storeName.get(quote.storeId)}
                        </span>
                        <span
                          className={`text-xs ${
                            quote.missing.length ? "text-warn" : "text-muted"
                          }`}
                        >
                          {quote.missing.length
                            ? fill(t.missing, { n: quote.missing.length })
                            : t.complete}
                        </span>
                      </span>
                      {isBest && (
                        <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
                          {t.best}
                        </span>
                      )}
                      <span className="num text-lg font-semibold">
                        {formatMoney(quote.total, tag)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {plan.split.length > 0 && stores.length > 1 && (
            <section>
              <h2 className="mb-1 text-lg">{t.splitTitle}</h2>
              <p className="mb-3 text-sm text-muted">
                {bestComplete && bestComplete.total > plan.splitTotal
                  ? fill(t.splitSaves, {
                      amount: formatMoney(
                        bestComplete.total - plan.splitTotal,
                        tag,
                      ),
                    })
                  : bestComplete
                    ? t.splitNoGain
                    : null}
              </p>
              <div className="flex flex-col gap-3">
                {stores
                  .map((store) => ({
                    store,
                    lines: plan.split.filter((s) => s.storeId === store.id),
                  }))
                  .filter((group) => group.lines.length > 0)
                  .map(({ store, lines }) => (
                    <div key={store.id} className="card p-4">
                      <div className="mb-2 flex justify-between font-medium">
                        <span>{store.name}</span>
                        <span className="num">
                          {formatMoney(
                            lines.reduce((s, l) => s + l.cost, 0),
                            tag,
                          )}
                        </span>
                      </div>
                      <ul className="text-sm text-muted">
                        {lines.map((l) => (
                          <li
                            key={l.productId}
                            className="flex justify-between"
                          >
                            <span>{productById.get(l.productId)?.name}</span>
                            <span className="num">
                              {formatMoney(l.cost, tag)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                <div className="flex justify-between px-1 text-lg font-semibold">
                  <span />
                  <span className="num">
                    {formatMoney(plan.splitTotal, tag)}
                  </span>
                </div>
              </div>
            </section>
          )}

          {plan.unpriced.length > 0 && (
            <p className="mt-4 text-sm text-warn">
              {fill(t.unpriced, {
                names: plan.unpriced
                  .map((id) => productById.get(id)?.name)
                  .join(", "),
              })}
            </p>
          )}
        </>
      )}
    </>
  );
}
