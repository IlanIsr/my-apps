"use client";

/**
 * One product: its latest price at each store (cheapest first, with how much
 * more the others cost, and the price per L / kg when its content is known),
 * its price history, and its details (editable: name, barcode, piece / kg,
 * shelf, content).
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { updateProductAction } from "@/app/actions";
import {
  AISLE_ICON,
  AISLES,
  CONTENT_UNITS,
  contentOf,
  formatDay,
  formatMoney,
  latestByStore,
  parseQuantity,
  pricePerMeasure,
  quantityToInput,
  type Aisle,
  type MeasuredProduct,
  type ContentUnit,
  type PricePoint,
  type Product,
  type Store,
  type Unit,
} from "@/lib/grocery-logic";
import { LOCALE_TAG, useLanguage, useTranslations } from "@/i18n";

import { Button } from "./Button";
import { ErrorLine, Field, PageHeader, fill } from "./common";
import { Segmented } from "./Segmented";
import { Select } from "./Select";
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
  aisle: string;
  noAisle: string;
  /** What one piece holds. */
  content: string;
  contentHint: string;
  contentUnits: Record<ContentUnit, string>;
  badContent: string;
};

export type AisleTexts = Record<Aisle, string>;

/** `"12,90 ₪/L"` — a price per L / kg, or `null`. */
export function measureLabel(
  product: MeasuredProduct,
  unitPrice: number,
  tag: string,
  units: Record<ContentUnit, string>,
): string | null {
  // A per-kg product already shows its price per kg.
  if (product.unit === "kg") return null;
  const m = pricePerMeasure(product, unitPrice);
  return m ? `${formatMoney(m.price, tag)}/${units[m.unit]}` : null;
}

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
  const [aisle, setAisle] = useState<Aisle | "none">(product.aisle ?? "none");
  // Not set yet: start from what the name says ("1.5 ליטר", "140 גרם").
  const known = contentOf(product);
  const [content, setContent] = useState(
    known ? quantityToInput(known.milli) : "",
  );
  const [contentUnit, setContentUnit] = useState<ContentUnit>(
    known?.unit ?? "l",
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const storeName = new Map(stores.map((s) => [s.id, s.name]));
  const latest = [...latestByStore(points).values()].sort(
    (a, b) => a.unitPrice - b.unitPrice,
  );
  const best = latest[0];
  const suffix = product.unit === "kg" ? t.perKg : "";
  const prices = points.map((p) => p.unitPrice);

  const measure = (price: number) =>
    measureLabel(product, price, tag, t.contentUnits);

  async function save() {
    const contentMilli = content.trim() ? parseQuantity(content) : null;
    if (content.trim() && !contentMilli) return setError(t.badContent);
    setBusy(true);
    setError(null);
    const result = await updateProductAction(product.id, {
      name,
      barcode,
      unit,
      aisle: aisle === "none" ? null : aisle,
      contentMilli: unit === "unit" ? contentMilli : null,
      contentUnit,
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
      <PageHeader
        eyebrow={
          [
            product.aisle &&
              `${AISLE_ICON[product.aisle]} ${messages.aisles[product.aisle]}`,
            product.unit === "unit" &&
              known &&
              `${quantityToInput(known.milli)} ${t.contentUnits[known.unit]}`,
            product.barcode,
          ]
            .filter(Boolean)
            .join(" · ") || undefined
        }
        title={product.name}
      >
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
                  <span className="num text-end font-semibold">
                    {formatMoney(p.unitPrice, tag)}
                    <span className="text-xs text-muted">{suffix}</span>
                    {measure(p.unitPrice) && (
                      <span className="block text-xs font-normal text-muted">
                        {measure(p.unitPrice)}
                      </span>
                    )}
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
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted">{t.aisle}</span>
              <Select
                aria-label={t.aisle}
                className="w-full sm:w-64"
                value={aisle}
                onChange={(v) => setAisle(v as Aisle | "none")}
                options={[
                  { key: "none", label: t.noAisle },
                  ...AISLES.map((a) => ({
                    key: a,
                    label: `${AISLE_ICON[a]} ${messages.aisles[a]}`,
                  })),
                ]}
              />
            </div>
            {unit === "unit" && (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted">
                  {t.content}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <TextInput
                    aria-label={t.content}
                    inputMode="decimal"
                    className="num w-28"
                    placeholder="1,5"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                  <Segmented
                    aria-label={t.content}
                    options={CONTENT_UNITS.map((u) => ({
                      value: u,
                      label: t.contentUnits[u],
                    }))}
                    value={contentUnit}
                    onChange={setContentUnit}
                  />
                </div>
                <span className="text-xs text-muted">{t.contentHint}</span>
              </div>
            )}
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
