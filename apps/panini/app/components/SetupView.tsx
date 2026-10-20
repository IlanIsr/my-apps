"use client";

/** First run: create the album (name, kids) — the card list is fixed. */

import { useState } from "react";

import { LIMITS } from "@/lib/album-logic";
import { Button } from "./Button";

import { Field, onFormSubmit } from "./Modal";
import { TextInput } from "./TextInput";

export type SetupTexts = {
  eyebrow: string;
  title: string;
  intro: string;
  name: string;
  defaultName: string;
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
          <TextInput
            id="f-name"
            name="name"
            required
            maxLength={LIMITS.name}
            defaultValue={t.defaultName}
          />
        </Field>
        <Field label={t.kids} htmlFor="f-kids" hint={t.kidsHint}>
          <TextInput id="f-kids" name="kids" placeholder={t.kidsPlaceholder} />
        </Field>
        <div className="mt-4.5 flex justify-end">
          <Button type="submit" variant="primary" disabled={busy}>
            {t.create}
          </Button>
        </div>
      </form>
    </div>
  );
}
