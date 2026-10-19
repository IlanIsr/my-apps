"use client";

/** First run: create the album (name, numbered cards, kids). */

import { useState } from "react";

import { LIMITS } from "@/lib/album-logic";

import { Field, onFormSubmit } from "./Modal";

export type SetupTexts = {
  eyebrow: string;
  title: string;
  intro: string;
  name: string;
  defaultName: string;
  total: string;
  totalHint: string;
  perPage: string;
  kids: string;
  kidsPlaceholder: string;
  kidsHint: string;
  reserveName: string;
  create: string;
};

export function SetupView({
  onCreate,
  t,
}: {
  onCreate: (input: {
    name: string;
    total: number;
    perPage: number;
    kids: string[];
    reserveName: string;
  }) => Promise<boolean>;
  t: SetupTexts;
}) {
  const [busy, setBusy] = useState(false);

  async function submit(form: FormData) {
    setBusy(true);
    await onCreate({
      name: String(form.get("name") ?? "").trim() || t.defaultName,
      total: Number(form.get("total")),
      perPage: Number(form.get("perPage")),
      kids: String(form.get("kids") ?? "")
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean)
        .slice(0, LIMITS.collectors),
      reserveName: t.reserveName,
    });
    setBusy(false);
  }

  return (
    <div className="mx-auto max-w-120 py-12">
      <p className="font-mono text-[11px] font-semibold tracking-[.14em] text-accent uppercase">
        {t.eyebrow}
      </p>
      <h1 className="mt-1.5 mb-1.5 text-[28px]">{t.title}</h1>
      <p className="mb-6 text-xs text-muted">{t.intro}</p>
      <form onSubmit={onFormSubmit(submit)}>
        <Field label={t.name} htmlFor="f-name">
          <input
            id="f-name"
            name="name"
            required
            maxLength={LIMITS.name}
            defaultValue={t.defaultName}
            className="field-input"
          />
        </Field>
        <Field label={t.kids} htmlFor="f-kids" hint={t.kidsHint}>
          <input
            id="f-kids"
            name="kids"
            placeholder={t.kidsPlaceholder}
            className="field-input"
          />
        </Field>
        <Field label={t.total} htmlFor="f-total" hint={t.totalHint}>
          <input
            id="f-total"
            name="total"
            type="number"
            min={1}
            max={LIMITS.totalCards}
            defaultValue={240}
            required
            className="field-input"
          />
        </Field>
        <Field label={t.perPage} htmlFor="f-perpage">
          <input
            id="f-perpage"
            name="perPage"
            type="number"
            min={1}
            max={LIMITS.perPage}
            defaultValue={6}
            required
            className="field-input"
          />
        </Field>
        <div className="mt-4.5 flex justify-end">
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {t.create}
          </button>
        </div>
      </form>
    </div>
  );
}
