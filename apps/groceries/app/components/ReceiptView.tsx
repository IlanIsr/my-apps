"use client";

/**
 * One receipt, laid out like the paper one: lines, sum, printed total and the
 * difference. Edit / delete from here.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { SimpleModal } from "@repo/ui/modal";

import { deleteReceiptAction } from "@/app/actions";
import {
  formatDay,
  formatMoney,
  formatQuantity,
  lineTotal,
  receiptTotal,
  type Receipt,
} from "@/lib/grocery-logic";
import { LOCALE_TAG, useLanguage, useTranslations } from "@/i18n";

import { Button } from "./Button";
import { ErrorLine, LinkButton, PageHeader, fill } from "./common";
import { CheckBadge } from "./ReceiptsView";

export type ReceiptTexts = {
  back: string;
  edit: string;
  delete: string;
  deleteTitle: string;
  deleteDescription: string;
  cancel: string;
  sum: string;
  printed: string;
  /** `{diff}`. */
  difference: string;
  discount: string;
  matches: string;
  mismatch: string;
};

export function ReceiptView({ receipt }: { receipt: Receipt }) {
  const messages = useTranslations();
  const t = messages.receipt;
  const tag = LOCALE_TAG[useLanguage().locale];
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = receiptTotal(receipt.lines);
  const diff =
    receipt.declaredTotal === null ? null : total - receipt.declaredTotal;

  async function remove() {
    setBusy(true);
    const result = await deleteReceiptAction(receipt.id);
    setBusy(false);
    if (!result.ok) return setError(messages.errors[result.error]);
    router.push("/receipts");
  }

  return (
    <>
      <Link href="/receipts" className="mb-2 inline-block text-sm text-muted">
        <span className="inline-block rtl:rotate-180">←</span> {t.back}
      </Link>
      <PageHeader
        eyebrow={formatDay(receipt.date, tag)}
        title={receipt.storeName}
      >
        <LinkButton href={`/receipts/${receipt.id}/edit`}>{t.edit}</LinkButton>
        <Button variant="danger" onClick={() => setConfirm(true)}>
          {t.delete}
        </Button>
      </PageHeader>

      <div className="card mx-auto max-w-md p-5">
        <ul className="flex flex-col gap-2">
          {receipt.lines.map((line, i) => (
            <li key={i} className="text-sm">
              <div className="flex justify-between gap-3">
                <Link
                  href={`/products/${line.productId}`}
                  className="min-w-0 hover:underline"
                >
                  {line.label}
                </Link>
                <span className="num shrink-0">
                  {formatMoney(lineTotal(line), tag)}
                </span>
              </div>
              <div className="num text-xs text-muted">
                {formatQuantity(line.quantityMilli, line.unit, tag)} ·{" "}
                {formatMoney(line.unitPrice, tag)}
                {line.unit === "kg" ? "/kg" : ""}
                {line.discount > 0 &&
                  ` · ${t.discount} −${formatMoney(line.discount, tag)}`}
                {line.barcode && ` · ${line.barcode}`}
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4 border-t border-dashed border-line-strong pt-3">
          <div className="flex justify-between text-lg font-semibold">
            <span>{t.sum}</span>
            <span className="num">{formatMoney(total, tag)}</span>
          </div>
          {receipt.declaredTotal !== null && (
            <>
              <div className="flex justify-between text-sm text-muted">
                <span>{t.printed}</span>
                <span className="num">
                  {formatMoney(receipt.declaredTotal, tag)}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <CheckBadge receipt={{ ...receipt, total }} t={t} />
                {diff !== 0 && diff !== null && (
                  <span className="num text-sm text-danger">
                    {fill(t.difference, {
                      diff: `${diff > 0 ? "+" : ""}${formatMoney(diff, tag)}`,
                    })}
                  </span>
                )}
              </div>
            </>
          )}
          {receipt.note && (
            <p className="mt-3 text-sm text-muted">{receipt.note}</p>
          )}
        </div>
      </div>

      <SimpleModal
        isOpen={confirm}
        onClose={() => setConfirm(false)}
        isDismissable={!busy}
        title={t.deleteTitle}
        description={t.deleteDescription}
        footer={
          <>
            <Button onClick={() => setConfirm(false)} disabled={busy}>
              {t.cancel}
            </Button>
            <Button variant="danger" onClick={remove} disabled={busy}>
              {t.delete}
            </Button>
          </>
        }
      >
        <ErrorLine message={error} />
      </SimpleModal>
    </>
  );
}
