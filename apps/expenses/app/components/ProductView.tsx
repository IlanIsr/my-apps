"use client";

/**
 * One product: its latest price at each store (cheapest first, with how much
 * more the others cost), its price history, and its details (editable).
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { updateProductAction } from "@/app/actions";
import {
  formatDay,
  formatMoney,
  latestByStore,
  type PricePoint,
  type Product,
  type Store,
  type Unit,
} from "@/lib/grocery-logic";
import { LOCALE_TAG, useLanguage, useTranslations } from "@/i18n";

import { Button } from "./Button";
import { ErrorLine, Field, PageHeader, fill } from "./common";
import { Segmented } from "./Segmented";
import { ShoppingToggle } from "./ShoppingToggle";
import { TextInput } from "./TextInput";

export type ProductTexts = {
  back: string;
  compare: string;
  store: string;
  lastPrice: string;
  date: string;
  cheapest: string;
  /** `{pct}`. */
  moreExpensive: string;
  history: string;
  noPrice: string;
  perKg: string;
  details: string;
  edit: string;
  name: string;
  barcode: string;
  unit: { unit: string; kg: string };
  save: string;
  cancel: string;
  /** `{min}`, `{max}`. */
  range: string;
};

export function ProductView({
  product,
  stores,
  points,
  inList,
}: {
  product: Product;
  stores: Store[];
  /** This product's purchases, oldest first. */
  points: PricePoint[];
  inList: boolean;
}) {
  const messages = useTranslations();
  const t = messages.product;
  const tag = LOCALE_TAG[useLanguage().locale];
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(product.name);
  const [barcode, setBarcode] = useState(product.barcode ?? "");
  const [unit, setUnit] = useState<Unit>(product.unit);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const storeName = new Map(stores.map((s) => [s.id, s.name]));
  const latest = [...latestByStore(points).values()].sort(
    (a, b) => a.unitPrice - b.unitPrice,
  );
  const best = latest[0];
  const suffix = product.unit === "kg" ? t.perKg : "";
  const prices = points.map((p) => p.unitPrice);

  async function save() {
    setBusy(true);
    setError(null);
    const result = await updateProductAction(product.id, {
      name,
      barcode,
      unit,
    });
    setBusy(false);
    if (!result.ok) return setError(messages.errors[result.error]);
    setEditing(false);
    router.refresh();
  }

  return (
    <>
      <Link href="/products" className="mb-2 inline-block text-sm text-muted">
        <span className="inline-block rtl:rotate-180">←</span> {t.back}
      </Link>
      <PageHeader eyebrow={product.barcode ?? undefined} title={product.name}>
        <ShoppingToggle
          productId={product.id}
          inList={inList}
          t={messages.shoppingToggle}
        />
      </PageHeader>

      <section className="mb-8">
        <h2 className="mb-1 text-lg">{t.compare}</h2>
        {prices.length > 1 && (
          <p className="mb-3 text-sm text-muted">
            {fill(t.range, {
              min: formatMoney(Math.min(...prices), tag),
              max: formatMoney(Math.max(...prices), tag),
            })}
          </p>
        )}
        {latest.length === 0 ? (
          <p className="text-muted">{t.noPrice}</p>
        ) : (
          <ul className="card divide-y divide-line">
            {latest.map((p) => {
              const pct = best
                ? Math.round(
                    ((p.unitPrice - best.unitPrice) / best.unitPrice) * 100,
                  )
                : 0;
              return (
                <li
                  key={p.storeId}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">
                      {storeName.get(p.storeId)}
                    </span>
                    <span className="text-xs text-muted">
                      {formatDay(p.date, tag)}
                    </span>
                  </span>
                  {p === best ? (
                    <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
                      {t.cheapest}
                    </span>
                  ) : (
                    pct > 0 && (
                      <span className="rounded-full bg-warn-soft px-2 py-0.5 text-xs font-medium text-warn">
                        {fill(t.moreExpensive, { pct })}
                      </span>
                    )
                  )}
                  <span className="num font-semibold">
                    {formatMoney(p.unitPrice, tag)}
                    <span className="text-xs text-muted">{suffix}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {points.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg">{t.history}</h2>
          <ul className="card divide-y divide-line text-sm">
            {[...points].reverse().map((p, i) => (
              <li key={i}>
                <Link
                  href={`/receipts/${p.receiptId}`}
                  className="flex gap-3 px-4 py-2 hover:bg-sunken"
                >
                  <span className="w-28 shrink-0 text-muted">
                    {formatDay(p.date, tag)}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {storeName.get(p.storeId)}
                  </span>
                  <span className="num">
                    {formatMoney(p.unitPrice, tag)}
                    <span className="text-xs text-muted">{suffix}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg">{t.details}</h2>
          {!editing && (
            <Button size="sm" onClick={() => setEditing(true)}>
              {t.edit}
            </Button>
          )}
        </div>
        {editing && (
          <div className="card flex flex-col gap-3 p-4">
            <Field label={t.name}>
              <TextInput
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field label={t.barcode}>
              <TextInput
                className="num"
                inputMode="numeric"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
              />
            </Field>
            <Segmented
              aria-label={t.unit.unit}
              options={[
                { value: "unit", label: t.unit.unit },
                { value: "kg", label: t.unit.kg },
              ]}
              value={unit}
              onChange={setUnit}
            />
            <ErrorLine message={error} />
            <div className="flex gap-2">
              <Button onClick={() => setEditing(false)} disabled={busy}>
                {t.cancel}
              </Button>
              <Button variant="primary" onClick={save} disabled={busy}>
                {t.save}
              </Button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
