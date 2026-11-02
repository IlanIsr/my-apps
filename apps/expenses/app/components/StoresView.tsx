"use client";

/**
 * The stores: how much was spent at each, how many receipts, the last visit.
 * Each opens its products (`/products?store=`); renamable in place.
 */

import { useRouter } from "next/navigation";
import { useState } from "react";

import { renameStoreAction } from "@/app/actions";
import {
  formatDay,
  formatMoney,
  type ReceiptSummary,
  type Store,
} from "@/lib/grocery-logic";
import { LOCALE_TAG, useLanguage, useTranslations } from "@/i18n";

import { Button } from "./Button";
import { EmptyState, ErrorLine, LinkButton, PageHeader, fill } from "./common";
import { TextInput } from "./TextInput";

export type StoresTexts = {
  title: string;
  emptyTitle: string;
  emptyDescription: string;
  /** `{n}`. */
  receiptCount: string;
  /** `{date}`. */
  lastVisit: string;
  products: string;
  rename: string;
  save: string;
  cancel: string;
};

export function StoresView({
  stores,
  receipts,
}: {
  stores: Store[];
  receipts: ReceiptSummary[];
}) {
  const messages = useTranslations();
  const t = messages.stores;
  const tag = LOCALE_TAG[useLanguage().locale];
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function rename(id: string) {
    setError(null);
    const result = await renameStoreAction(id, name);
    if (!result.ok) return setError(messages.errors[result.error]);
    setEditing(null);
    router.refresh();
  }

  if (stores.length === 0) {
    return (
      <>
        <PageHeader title={t.title} />
        <EmptyState title={t.emptyTitle} description={t.emptyDescription} />
      </>
    );
  }

  const rows = stores
    .map((store) => {
      const list = receipts.filter((r) => r.storeId === store.id);
      return {
        store,
        total: list.reduce((s, r) => s + r.total, 0),
        count: list.length,
        last: list[0]?.date ?? null,
      };
    })
    .sort((a, b) => b.total - a.total);

  return (
    <>
      <PageHeader title={t.title} />
      <ul className="card divide-y divide-line">
        {rows.map(({ store, total, count, last }) => (
          <li key={store.id} className="flex flex-col gap-2 px-4 py-3">
            {editing === store.id ? (
              <div className="flex flex-wrap gap-2">
                <TextInput
                  aria-label={t.rename}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="min-w-0 flex-1"
                />
                <Button onClick={() => setEditing(null)}>{t.cancel}</Button>
                <Button variant="primary" onClick={() => rename(store.id)}>
                  {t.save}
                </Button>
                <ErrorLine message={error} />
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{store.name}</span>
                  <span className="text-xs text-muted">
                    {fill(t.receiptCount, { n: count })}
                    {last &&
                      ` · ${fill(t.lastVisit, { date: formatDay(last, tag) })}`}
                  </span>
                </span>
                <span className="num font-semibold">
                  {formatMoney(total, tag)}
                </span>
                <LinkButton size="sm" href={`/products?store=${store.id}`}>
                  {t.products}
                </LinkButton>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setName(store.name);
                    setEditing(store.id);
                  }}
                >
                  {t.rename}
                </Button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
