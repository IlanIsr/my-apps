"use client";

/** Add a card, or edit / delete an existing one. */

import { useState } from "react";

import { LIMITS, type Card } from "@/lib/album-logic";

import { Field, Modal, onFormSubmit, type ModalTexts } from "./Modal";

export type CardModalTexts = {
  addTitle: string;
  editTitle: string;
  card: string;
  code: string;
  codePlaceholder: string;
  page: string;
  label: string;
  labelPlaceholder: string;
  add: string;
  save: string;
  cancel: string;
  delete: string;
  confirmDelete: (code: string) => string;
};

export function CardModal({
  card,
  defaultCode,
  defaultPage,
  onAdd,
  onUpdate,
  onDelete,
  onClose,
  t,
  modalT,
}: {
  /** The card being edited, or undefined to add one. */
  card?: Card;
  defaultCode: string;
  defaultPage: number;
  onAdd: (input: {
    code: string;
    page: number;
    label: string;
  }) => Promise<boolean>;
  onUpdate: (
    cardId: string,
    input: { page: number; label: string },
  ) => Promise<boolean>;
  onDelete: (cardId: string) => Promise<boolean>;
  onClose: () => void;
  t: CardModalTexts;
  modalT: ModalTexts;
}) {
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function submit(form: FormData) {
    setBusy(true);
    const page = Number(form.get("page"));
    const label = String(form.get("label") ?? "").trim();
    const ok = card
      ? await onUpdate(card.id, { page, label })
      : await onAdd({
          code: String(form.get("code") ?? "").trim(),
          page,
          label,
        });
    setBusy(false);
    if (ok) onClose();
  }

  async function remove() {
    if (!card) return;
    setBusy(true);
    const ok = await onDelete(card.id);
    setBusy(false);
    if (ok) onClose();
  }

  if (card && confirming) {
    return (
      <Modal title={t.delete} onClose={onClose} t={modalT}>
        <p className="mb-4.5 text-sm text-muted">
          {t.confirmDelete(card.code)}
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setConfirming(false)}
          >
            {t.cancel}
          </button>
          <button
            type="button"
            className="btn btn-danger"
            disabled={busy}
            onClick={remove}
          >
            {t.delete}
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title={card ? t.editTitle : t.addTitle} onClose={onClose} t={modalT}>
      <form onSubmit={onFormSubmit(submit)}>
        {card ? (
          <p className="mb-3.5 text-xs text-muted">
            {t.card}{" "}
            <span className="font-mono font-bold text-foreground">
              {card.code}
            </span>
          </p>
        ) : (
          <Field label={t.code} htmlFor="c-code">
            <input
              id="c-code"
              name="code"
              required
              maxLength={LIMITS.code}
              defaultValue={defaultCode}
              placeholder={t.codePlaceholder}
              className="field-input"
            />
          </Field>
        )}
        <Field label={t.page} htmlFor="c-page">
          <input
            id="c-page"
            name="page"
            type="number"
            min={1}
            max={LIMITS.page}
            required
            defaultValue={card?.page ?? defaultPage}
            className="field-input"
          />
        </Field>
        <Field label={t.label} htmlFor="c-label">
          <input
            id="c-label"
            name="label"
            maxLength={LIMITS.label}
            defaultValue={card?.label ?? ""}
            placeholder={t.labelPlaceholder}
            className="field-input"
          />
        </Field>
        <div
          className={`mt-4.5 flex gap-2 ${card ? "justify-between" : "justify-end"}`}
        >
          {card && (
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => setConfirming(true)}
            >
              {t.delete}
            </button>
          )}
          <span className="flex gap-2">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              {t.cancel}
            </button>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {card ? t.save : t.add}
            </button>
          </span>
        </div>
      </form>
    </Modal>
  );
}
