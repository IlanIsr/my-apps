"use client";

/**
 * Set (or remove) the prize for completing a page: "before a date", "the
 * first N to finish", or a ranking of tiers (first one wins X, next two Y…).
 */

import { useState } from "react";

import {
  LIMITS,
  type PageReward,
  type RewardKind,
  type RewardTier,
} from "@/lib/album-logic";

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
  kindTiers: string;
  tierWinners: string;
  tierPrize: string;
  addTier: string;
  removeTier: string;
  tiersHint: string;
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
  const [tiers, setTiers] = useState<RewardTier[]>(
    reward?.tiers ?? [{ winners: 1, prize: "" }],
  );
  const [busy, setBusy] = useState(false);

  const setTier = (i: number, patch: Partial<RewardTier>) =>
    setTiers((ts) => ts.map((t, j) => (j === i ? { ...t, ...patch } : t)));

  async function submit(form: FormData) {
    setBusy(true);
    const ok = await onSave({
      page: page ?? Number(form.get("page")),
      prize: String(form.get("prize") ?? "").trim(),
      kind,
      deadline: kind === "deadline" ? String(form.get("deadline")) : null,
      winners: kind === "first_n" ? Number(form.get("winners")) : null,
      tiers:
        kind === "tiers"
          ? tiers.map((t) => ({ winners: t.winners, prize: t.prize.trim() }))
          : null,
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
        {kind !== "tiers" && (
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
        )}
        <div className="mb-3.5 flex flex-col gap-1.5">
          <span className="text-[12.5px] font-semibold text-muted">
            {t.kind}
          </span>
          <div className="flex gap-1 rounded-xl bg-sunken p-1">
            {kindButton("deadline", t.kindDeadline)}
            {kindButton("first_n", t.kindFirstN)}
            {kindButton("tiers", t.kindTiers)}
          </div>
        </div>
        {kind === "tiers" ? (
          <div className="mb-3.5 flex flex-col gap-2">
            <p className="text-xs text-muted">{t.tiersHint}</p>
            {tiers.map((tier, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  max={LIMITS.winners}
                  required
                  value={tier.winners}
                  onChange={(e) =>
                    setTier(i, { winners: Number(e.target.value) })
                  }
                  aria-label={t.tierWinners}
                  className="field-input w-20!"
                />
                <input
                  required
                  maxLength={LIMITS.prize}
                  value={tier.prize}
                  onChange={(e) => setTier(i, { prize: e.target.value })}
                  placeholder={t.tierPrize}
                  aria-label={t.tierPrize}
                  className="field-input"
                />
                {tiers.length > 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setTiers((ts) => ts.filter((_, j) => j !== i))
                    }
                    aria-label={t.removeTier}
                    className="px-1 text-muted hover:text-danger"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            {tiers.length < LIMITS.tiers && (
              <button
                type="button"
                onClick={() =>
                  setTiers((ts) => [...ts, { winners: 1, prize: "" }])
                }
                className="self-start text-sm font-semibold text-accent"
              >
                {t.addTier}
              </button>
            )}
          </div>
        ) : kind === "deadline" ? (
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
