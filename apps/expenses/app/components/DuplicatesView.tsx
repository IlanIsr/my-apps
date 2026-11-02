"use client";

/**
 * Products that may be the same one (alike names), one card per pair. For
 * each, the user decides: yes = merge (pick which name / barcode to keep;
 * every receipt line and the shopping list move to the kept product), no =
 * two different products, never suggested again. Nothing merges on its own.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { markDistinctAction, mergeProductsAction } from "@/app/actions";
import {
  duplicateSuggestions,
  formatMoney,
  pairKey,
  type DuplicateSuggestion,
  type PricePoint,
  type Product,
} from "@/lib/grocery-logic";
import { LOCALE_TAG, useLanguage, useTranslations } from "@/i18n";

import { Button } from "./Button";
import { EmptyState, ErrorLine, PageHeader, fill } from "./common";
import { Segmented } from "./Segmented";

export type DuplicatesTexts = {
  back: string;
  title: string;
  description: string;
  emptyTitle: string;
  emptyDescription: string;
  /** `{n}` purchases. */
  purchases: string;
  /** `{price}`. */
  lastPrice: string;
  noBarcode: string;
  keepName: string;
  keepBarcode: string;
  same: string;
  different: string;
};

const short = (name: string) =>
  name.length > 24 ? `${name.slice(0, 23)}…` : name;

type Stats = Map<string, { count: number; last: PricePoint }>;

export function DuplicatesView({
  products,
  points,
  distinctPairs,
}: {
  products: Product[];
  points: PricePoint[];
  distinctPairs: string[];
}) {
  const t = useTranslations().duplicates;
  const suggestions = useMemo(
    () => duplicateSuggestions(products, new Set(distinctPairs)),
    [products, distinctPairs],
  );
  const stats = useMemo(() => {
    const out: Stats = new Map();
    for (const p of points) {
      const s = out.get(p.productId);
      out.set(p.productId, {
        count: (s?.count ?? 0) + 1,
        last: !s || p.date >= s.last.date ? p : s.last,
      });
    }
    return out;
  }, [points]);
  // A product merged away disappears from every other card at once.
  const [gone, setGone] = useState<Set<string>>(new Set());
  const shown = suggestions.filter(
    (s) => !gone.has(s.a.id) && !gone.has(s.b.id),
  );

  return (
    <>
      <Link href="/products" className="mb-2 inline-block text-sm text-muted">
        <span className="inline-block rtl:rotate-180">←</span> {t.back}
      </Link>
      <PageHeader title={t.title} />
      <p className="mb-4 text-sm text-muted">{t.description}</p>
      {shown.length === 0 ? (
        <EmptyState title={t.emptyTitle} description={t.emptyDescription} />
      ) : (
        <ul className="flex flex-col gap-4">
          {shown.map((s) => (
            <DuplicateCard
              key={pairKey(s.a.id, s.b.id)}
              suggestion={s}
              stats={stats}
              t={t}
              onDone={(dropped) =>
                dropped && setGone((g) => new Set(g).add(dropped))
              }
            />
          ))}
        </ul>
      )}
    </>
  );
}

function DuplicateCard({
  suggestion,
  stats,
  t,
  onDone,
}: {
  suggestion: DuplicateSuggestion;
  stats: Stats;
  t: DuplicatesTexts;
  /** `dropped` = the id merged away, `null` when declared different. */
  onDone: (dropped: string | null) => void;
}) {
  const messages = useTranslations();
  const tag = LOCALE_TAG[useLanguage().locale];
  const router = useRouter();
  const { a, b } = suggestion;
  // Keep the most bought one by default.
  const [keepId, setKeepId] = useState(
    (stats.get(b.id)?.count ?? 0) > (stats.get(a.id)?.count ?? 0) ? b.id : a.id,
  );
  const keep = keepId === a.id ? a : b;
  const drop = keepId === a.id ? b : a;
  const [code, setCode] = useState<"keep" | "drop">("keep");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);

  const barcode =
    code === "drop" ? drop.barcode : (keep.barcode ?? drop.barcode);
  const bothBarcodes =
    keep.barcode && drop.barcode && keep.barcode !== drop.barcode;

  async function decide(merge: boolean) {
    setBusy(true);
    setError(null);
    const result = merge
      ? await mergeProductsAction(keep.id, drop.id, {
          name: keep.name,
          barcode,
        })
      : await markDistinctAction(a.id, b.id);
    setBusy(false);
    if (!result.ok) return setError(messages.errors[result.error]);
    setHidden(true);
    onDone(merge ? drop.id : null);
    router.refresh();
  }

  if (hidden) return null;

  const side = (p: Product) => {
    const s = stats.get(p.id);
    return (
      <div
        className={`min-w-0 flex-1 rounded-lg border p-3 ${
          p.id === keepId ? "border-accent" : "border-line"
        }`}
      >
        <Link
          href={`/products/${p.id}`}
          className="block truncate font-medium hover:underline"
        >
          {p.name}
        </Link>
        <span className="num block text-xs text-muted">
          {p.barcode ?? t.noBarcode}
        </span>
        <span className="block text-xs text-muted">
          {fill(t.purchases, { n: s?.count ?? 0 })}
          {s &&
            ` · ${fill(t.lastPrice, { price: formatMoney(s.last.unitPrice, tag) })}`}
        </span>
      </div>
    );
  };

  return (
    <li className="card flex flex-col gap-3 p-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        {side(a)}
        {side(b)}
      </div>
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted">{t.keepName}</span>
          <Segmented
            aria-label={t.keepName}
            options={[a, b].map((p) => ({ value: p.id, label: short(p.name) }))}
            value={keepId}
            onChange={setKeepId}
          />
        </div>
        {bothBarcodes && (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted">
              {t.keepBarcode}
            </span>
            <Segmented
              aria-label={t.keepBarcode}
              options={[
                { value: "keep", label: keep.barcode! },
                { value: "drop", label: drop.barcode! },
              ]}
              value={code}
              onChange={setCode}
            />
          </div>
        )}
      </div>
      <ErrorLine message={error} />
      <div className="flex flex-wrap justify-end gap-2">
        <Button onClick={() => decide(false)} disabled={busy}>
          ✕ {t.different}
        </Button>
        <Button variant="primary" onClick={() => decide(true)} disabled={busy}>
          ✓ {t.same}
        </Button>
      </div>
    </li>
  );
}
