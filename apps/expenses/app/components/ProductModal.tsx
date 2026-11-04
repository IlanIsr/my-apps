"use client";

/**
 * The Products page's round "+": a new product by hand (no price yet — it is
 * recognised in later receipts), or, for many products with their prices, a
 * friend's receipt (prices only, not an expense).
 */

import { useRouter } from "next/navigation";
import { useState } from "react";

import { SimpleModal } from "@repo/ui/modal";

import { createProductAction } from "@/app/actions";
import { useTranslations } from "@/i18n";

import { Button } from "./Button";
import { ErrorLine, LinkButton } from "./common";
import {
  draftToInput,
  ProductFields,
  toProductDraft,
  type ProductDraft,
} from "./ProductFields";

export type ProductModalTexts = {
  add: string;
  title: string;
  /** A friend's receipt: many products with their prices. */
  friendHint: string;
  friendReceipt: string;
  create: string;
  cancel: string;
};

export function AddProduct() {
  const messages = useTranslations();
  const t = messages.productModal;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ProductDraft>(() => toProductDraft(null));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function close() {
    setOpen(false);
    setDraft(toProductDraft(null));
    setError(null);
  }

  async function create() {
    const input = draftToInput(draft);
    if (!input) return setError(messages.product.badContent);
    setBusy(true);
    setError(null);
    const result = await createProductAction(input);
    setBusy(false);
    if (!result.ok) return setError(messages.errors[result.error]);
    close();
    router.refresh();
  }

  return (
    <>
      <div className="fixed end-5 bottom-5 z-10">
        <Button
          variant="primary"
          isIconOnly
          aria-label={t.add}
          onClick={() => setOpen(true)}
          className="size-14 rounded-full text-2xl shadow-card"
        >
          +
        </Button>
      </div>
      <SimpleModal
        isOpen={open}
        onClose={close}
        isDismissable={!busy}
        title={t.title}
        footer={
          <div className="flex w-full justify-end gap-2">
            <Button onClick={close} disabled={busy}>
              {t.cancel}
            </Button>
            <Button
              variant="primary"
              onClick={create}
              disabled={busy || !draft.name.trim()}
            >
              {t.create}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-sunken px-3 py-2">
            <span className="text-xs text-muted">{t.friendHint}</span>
            <LinkButton href="/receipts/new?friend=1" size="sm">
              🧾 {t.friendReceipt}
            </LinkButton>
          </div>
          <ProductFields draft={draft} onChange={setDraft} autoFocus />
          <ErrorLine message={error} />
        </div>
      </SimpleModal>
    </>
  );
}
