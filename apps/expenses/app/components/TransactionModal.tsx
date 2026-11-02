"use client";

/**
 * Quick add / edit of one expense: amount first (big, decimal keypad),
 * category chips, merchant (suggested from past ones — picking one also picks
 * its usual category), cash / card (cash by default), date (today), note.
 * A receipt's transaction only takes a category / note here.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { SimpleModal } from "@repo/ui/modal";

import {
  createTransactionAction,
  deleteTransactionAction,
  updateTransactionAction,
} from "@/app/actions";
import {
  categoryLabel,
  merchantKey,
  type Category,
  type CategoryRules,
  type DefaultCategoryKey,
  type Method,
  type Transaction,
} from "@/lib/expense-logic";
import { centsToInput, parseMoney, today } from "@/lib/grocery-logic";
import { useTranslations } from "@/i18n";

import { Button } from "./Button";
import { Combo } from "./Combo";
import { ErrorLine, Field } from "./common";
import { Segmented } from "./Segmented";
import { TextInput } from "./TextInput";

export type TransactionModalTexts = {
  addTitle: string;
  editTitle: string;
  amount: string;
  category: string;
  merchant: string;
  merchantPlaceholder: string;
  method: string;
  date: string;
  note: string;
  save: string;
  cancel: string;
  delete: string;
  badAmount: string;
  fromReceipt: string;
  openReceipt: string;
};

export type MethodTexts = Record<Method, string>;
export type CategoryNameTexts = Record<DefaultCategoryKey, string>;

export function TransactionModal({
  transaction,
  categories,
  rules,
  merchants,
  onClose,
}: {
  /** `null` = a new expense. */
  transaction: Transaction | null;
  categories: Category[];
  rules: CategoryRules;
  merchants: string[];
  onClose: () => void;
}) {
  const messages = useTranslations();
  const t = messages.transactionModal;
  const router = useRouter();
  const fromReceipt = transaction?.receiptId ?? null;

  const [amount, setAmount] = useState(
    transaction ? centsToInput(transaction.amount) : "",
  );
  const [categoryId, setCategoryId] = useState(transaction?.categoryId ?? null);
  const [picked, setPicked] = useState(Boolean(transaction));
  const [merchant, setMerchant] = useState(transaction?.merchant ?? "");
  const [method, setMethod] = useState<Method>(transaction?.method ?? "cash");
  const [date, setDate] = useState(transaction?.date ?? today());
  const [note, setNote] = useState(transaction?.note ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const shown = categories.filter(
    (c) => !c.archived || c.id === transaction?.categoryId,
  );

  /** A known merchant brings its usual category, until one is picked by hand. */
  function changeMerchant(text: string) {
    setMerchant(text);
    const rule = rules[merchantKey(text)];
    if (rule && !picked) setCategoryId(rule);
  }

  async function save() {
    const cents = parseMoney(amount);
    if (!cents) return setError(t.badAmount);
    setBusy(true);
    setError(null);
    const input = {
      date,
      amount: cents,
      categoryId,
      merchant: merchant.trim() || null,
      method,
      note: note.trim() || null,
    };
    const result = transaction
      ? await updateTransactionAction(transaction.id, input)
      : await createTransactionAction(input);
    setBusy(false);
    if (!result.ok) return setError(messages.errors[result.error]);
    router.refresh();
    onClose();
  }

  async function remove() {
    if (!transaction) return;
    setBusy(true);
    const result = await deleteTransactionAction(transaction.id);
    setBusy(false);
    if (!result.ok) return setError(messages.errors[result.error]);
    router.refresh();
    onClose();
  }

  return (
    <SimpleModal
      isOpen
      onClose={onClose}
      isDismissable={!busy}
      title={transaction ? t.editTitle : t.addTitle}
      footer={
        <div className="flex w-full flex-wrap items-center gap-2">
          {transaction && !fromReceipt && (
            <Button variant="danger" onClick={remove} disabled={busy}>
              {t.delete}
            </Button>
          )}
          <div className="ms-auto flex gap-2">
            <Button onClick={onClose} disabled={busy}>
              {t.cancel}
            </Button>
            <Button variant="primary" onClick={save} disabled={busy}>
              {t.save}
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {fromReceipt && (
          <p className="text-sm text-muted">
            {t.fromReceipt}{" "}
            <Link href={`/receipts/${fromReceipt}`} className="underline">
              {t.openReceipt}
            </Link>
          </p>
        )}
        <Field label={t.amount}>
          <TextInput
            inputMode="decimal"
            autoFocus={!transaction}
            placeholder="0,00"
            className="num text-2xl"
            value={amount}
            disabled={Boolean(fromReceipt)}
            onChange={(e) => setAmount(e.target.value)}
          />
        </Field>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted">{t.category}</span>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {shown.map((c) => (
              <Button
                key={c.id}
                size="sm"
                variant={c.id === categoryId ? "primary" : "outline"}
                onClick={() => {
                  setCategoryId(c.id === categoryId ? null : c.id);
                  setPicked(true);
                }}
                className="w-full min-w-0 justify-start overflow-hidden px-2.5"
              >
                <span aria-hidden>{c.icon}</span>
                <span className="truncate">
                  {categoryLabel(c, messages.categoryNames)}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {!fromReceipt && (
          <>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted">
                {t.merchant}
              </span>
              <Combo
                aria-label={t.merchant}
                placeholder={t.merchantPlaceholder}
                value={merchant}
                onChange={changeMerchant}
                options={merchants.map((m) => ({ key: m, label: m }))}
              />
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted">
                  {t.method}
                </span>
                <Segmented
                  aria-label={t.method}
                  options={[
                    { value: "cash", label: `💵 ${messages.methods.cash}` },
                    { value: "card", label: `💳 ${messages.methods.card}` },
                  ]}
                  value={method}
                  onChange={setMethod}
                />
              </div>
              <Field label={t.date} className="min-w-40 flex-1">
                <TextInput
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </Field>
            </div>
          </>
        )}

        <Field label={t.note}>
          <TextInput value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
        <ErrorLine message={error} />
      </div>
    </SimpleModal>
  );
}
