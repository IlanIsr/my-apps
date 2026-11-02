"use client";

/**
 * Quick add / edit of one expense: amount first (big, decimal keypad),
 * category chips, merchant (suggested from past ones — picking one also picks
 * its usual category), cash / card (cash by default), date (today), note.
 * Fuel & co. can be entered by the litre (litres × price per litre = the
 * amount).
 * A receipt's transaction only takes a category / note here.
 */

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { SimpleModal } from "@repo/ui/modal";

import {
  createTransactionAction,
  deleteTransactionAction,
  getReceiptAction,
  updateTransactionAction,
} from "@/app/actions";
import {
  categoryLabel,
  litersAmount,
  merchantKey,
  METHOD_ICON,
  METHODS,
  type Category,
  type CategoryRules,
  type DefaultCategoryKey,
  type Method,
  type Transaction,
} from "@/lib/expense-logic";
import {
  centsToInput,
  formatMoney,
  parseMoney,
  parseQuantity,
  quantityToInput,
  today,
  type Receipt,
} from "@/lib/grocery-logic";
import { LOCALE_TAG, useLanguage, useTranslations } from "@/i18n";

import { Button } from "./Button";
import { Combo } from "./Combo";
import { ErrorLine, Field, LinkButton } from "./common";
import { ReceiptLines } from "./ReceiptView";
import { Segmented } from "./Segmented";
import { TextArea } from "./TextArea";
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
  byAmount: string;
  byLiter: string;
  liters: string;
  pricePerLiter: string;
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
  const tag = LOCALE_TAG[useLanguage().locale];
  const router = useRouter();
  const fromReceipt = transaction?.receiptId ?? null;

  const [amount, setAmount] = useState(
    transaction ? centsToInput(transaction.amount) : "",
  );
  const [byLiter, setByLiter] = useState(Boolean(transaction?.litersMilli));
  const [liters, setLiters] = useState(
    transaction?.litersMilli ? quantityToInput(transaction.litersMilli) : "",
  );
  const [perLiter, setPerLiter] = useState(
    transaction?.pricePerLiter ? centsToInput(transaction.pricePerLiter) : "",
  );
  const litersMilli = parseQuantity(liters);
  const pricePerLiter = parseMoney(perLiter);
  const literTotal =
    litersMilli && pricePerLiter
      ? litersAmount(litersMilli, pricePerLiter)
      : null;
  const [categoryId, setCategoryId] = useState(transaction?.categoryId ?? null);
  const [picked, setPicked] = useState(Boolean(transaction));
  const [merchant, setMerchant] = useState(transaction?.merchant ?? "");
  const [method, setMethod] = useState<Method>(transaction?.method ?? "cash");
  const [date, setDate] = useState(transaction?.date ?? today());
  const [note, setNote] = useState(transaction?.note ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // A receipt's expense shows what was bought.
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  useEffect(() => {
    if (!fromReceipt) return;
    let live = true;
    void getReceiptAction(fromReceipt).then((result) => {
      if (live && result.ok) setReceipt(result.data);
    });
    return () => {
      live = false;
    };
  }, [fromReceipt]);

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
    const cents = byLiter ? literTotal : parseMoney(amount);
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
      litersMilli: byLiter ? litersMilli : null,
      pricePerLiter: byLiter ? pricePerLiter : null,
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
      title={
        fromReceipt ? (
          <span className="flex w-full items-center justify-between gap-3">
            <span>{t.editTitle}</span>
            <LinkButton href={`/receipts/${fromReceipt}`} size="sm">
              🧾 {t.openReceipt}
            </LinkButton>
          </span>
        ) : transaction ? (
          t.editTitle
        ) : (
          t.addTitle
        )
      }
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
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted">{t.fromReceipt}</p>
            <div className="max-h-64 overflow-y-auto rounded-lg bg-sunken p-3">
              {receipt ? (
                <ReceiptLines lines={receipt.lines} t={messages.receipt} />
              ) : (
                <p className="text-xs text-muted">…</p>
              )}
            </div>
          </div>
        )}
        {!fromReceipt && (
          <Segmented
            aria-label={t.amount}
            options={[
              { value: "amount", label: t.byAmount },
              { value: "liter", label: `⛽ ${t.byLiter}` },
            ]}
            value={byLiter ? "liter" : "amount"}
            onChange={(v) => setByLiter(v === "liter")}
          />
        )}
        {byLiter ? (
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-3">
              <Field label={t.liters}>
                <TextInput
                  inputMode="decimal"
                  autoFocus={!transaction}
                  placeholder="0,00"
                  className="num text-lg"
                  value={liters}
                  onChange={(e) => setLiters(e.target.value)}
                />
              </Field>
              <Field label={t.pricePerLiter}>
                <TextInput
                  inputMode="decimal"
                  placeholder="0,00"
                  className="num text-lg"
                  value={perLiter}
                  onChange={(e) => setPerLiter(e.target.value)}
                />
              </Field>
            </div>
            <div className="flex items-baseline justify-between rounded-lg bg-sunken px-3 py-2">
              <span className="text-xs font-medium text-muted">{t.amount}</span>
              <span className="num text-2xl font-semibold">
                {literTotal === null ? "—" : formatMoney(literTotal, tag)}
              </span>
            </div>
          </div>
        ) : (
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
        )}

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
                  options={METHODS.map((m) => ({
                    value: m,
                    label: `${METHOD_ICON[m]} ${messages.methods[m]}`,
                  }))}
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
          <TextArea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </Field>
        <ErrorLine message={error} />
      </div>
    </SimpleModal>
  );
}
