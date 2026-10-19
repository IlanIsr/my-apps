"use client";

/**
 * Set (or remove) the prize for completing a page: either "before a date" or
 * "the first N to finish".
 */

import { useState } from "react";

import { LIMITS, type PageReward, type RewardKind } from "@/lib/album-logic";

import { Field, Modal, onFormSubmit, type ModalTexts } from "./Modal";

export type RewardModalTexts = {
  title: (page: number) => string;
  newTitle: string;
  page: string;
  prize: string;
  prizePlaceholder: string;
  kind: string;
  kindDeadline: string;
  kindFirstN: string;
  deadline: string;
  winners: string;
  winnersHint: string;
  save: string;
  cancel: string;
  remove: string;
};

export function RewardModal({
  page,
  pages,
  reward,
  onSave,
  onDelete,
  onClose,
  t,
  modalT,
}: {
  /** Fixed page (from a page header), or undefined to pick one. */
  page?: number;
  pages: number[];
  reward?: PageReward;
  onSave: (reward: PageReward) => Promise<boolean>;
  onDelete: (page: number) => Promise<boolean>;
  onClose: () => void;
  t: RewardModalTexts;
  modalT: ModalTexts;
}) {
  const [kind, setKind] = useState<RewardKind>(reward?.kind ?? "deadline");
  const [busy, setBusy] = useState(false);

  async function submit(form: FormData) {
    setBusy(true);
    const ok = await onSave({
      page: page ?? Number(form.get("page")),
      prize: String(form.get("prize") ?? "").trim(),
      kind,
      deadline: kind === "deadline" ? String(form.get("deadline")) : null,
      winners: kind === "first_n" ? Number(form.get("winners")) : null,
    });
    setBusy(false);
    if (ok) onClose();
  }

  async function remove() {
    if (!reward) return;
    setBusy(true);
    const ok = await onDelete(reward.page);
    setBusy(false);
    if (ok) onClose();
  }

  const kindButton = (value: RewardKind, label: string) => (
    <button
      type="button"
      onClick={() => setKind(value)}
      aria-pressed={kind === value}
      className={`flex-1 rounded-md px-2.5 py-2 text-[13.5px] font-semibold ${
        kind === value ? "bg-surface text-foreground shadow-card" : "text-muted"
      }`}
    >
      {label}
    </button>
  );

  return (
    <Modal
      title={page ? t.title(page) : t.newTitle}
      onClose={onClose}
      t={modalT}
    >
      <form onSubmit={onFormSubmit(submit)}>
        {!page && (
          <Field label={t.page} htmlFor="r-page">
            <select id="r-page" name="page" required className="field-input">
              {pages.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>
        )}
        <Field label={t.prize} htmlFor="r-prize">
          <input
            id="r-prize"
            name="prize"
            required
            maxLength={LIMITS.prize}
            defaultValue={reward?.prize ?? ""}
            placeholder={t.prizePlaceholder}
            className="field-input"
          />
        </Field>
        <div className="mb-3.5 flex flex-col gap-1.5">
          <span className="text-[12.5px] font-semibold text-muted">
            {t.kind}
          </span>
          <div className="flex gap-1 rounded-xl bg-sunken p-1">
            {kindButton("deadline", t.kindDeadline)}
            {kindButton("first_n", t.kindFirstN)}
          </div>
        </div>
        {kind === "deadline" ? (
          <Field label={t.deadline} htmlFor="r-deadline">
            <input
              id="r-deadline"
              name="deadline"
              type="date"
              required
              defaultValue={reward?.deadline ?? ""}
              className="field-input"
            />
          </Field>
        ) : (
          <Field label={t.winners} htmlFor="r-winners" hint={t.winnersHint}>
            <input
              id="r-winners"
              name="winners"
              type="number"
              min={1}
              max={LIMITS.winners}
              required
              defaultValue={reward?.winners ?? ""}
              className="field-input"
            />
          </Field>
        )}
        <div
          className={`mt-4.5 flex gap-2 ${reward ? "justify-between" : "justify-end"}`}
        >
          {reward && (
            <button
              type="button"
              className="btn btn-danger"
              disabled={busy}
              onClick={remove}
            >
              {t.remove}
            </button>
          )}
          <span className="flex gap-2">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              {t.cancel}
            </button>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {t.save}
            </button>
          </span>
        </div>
      </form>
    </Modal>
  );
}
