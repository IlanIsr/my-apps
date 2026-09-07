"use client";

/**
 * "Edit details" panel on the anniversary detail page: name, type, Hebrew
 * name, origin, Hebrew year. Calls {@link updatePersonAction}. A name or type
 * change recomputes the dedup key and re-syncs the calendar event titles (and
 * colour, for a type change); the other fields are store-only.
 */

import { useState } from "react";

import { useLanguage } from "@/i18n";
import type { Anniversary, AnniversaryType } from "@repo/anniversaries/person";
import { updatePersonAction } from "../../anniversaries/actions";
import { Segmented } from "../Segmented";

/** Text for {@link EditPersonForm}. */
export type EditPersonFormTexts = {
  name: string;
  type: string;
  types: { birthday: string; yahrzeit: string };
  hebrewName: string;
  origin: string;
  hebYear: string;
  optional: string;
  save: string;
  saving: string;
  cancel: string;
  nameRequired: string;
  rateLimited: string;
  error: (message: string) => string;
};

export function EditPersonForm({
  anniversary,
  t,
  onDone,
}: {
  anniversary: Anniversary;
  t: EditPersonFormTexts;
  onDone: () => void;
}) {
  const { locale } = useLanguage();
  const [name, setName] = useState(anniversary.name);
  const [type, setType] = useState<AnniversaryType>(anniversary.type);
  const [hebrewName, setHebrewName] = useState(anniversary.hebrewName ?? "");
  const [origin, setOrigin] = useState(anniversary.origin ?? "");
  const [hebYear, setHebYear] = useState(
    anniversary.hebYear ? String(anniversary.hebYear) : "",
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!name.trim()) {
      setError(t.nameRequired);
      return;
    }
    setPending(true);
    setError(null);
    const result = await updatePersonAction({
      id: anniversary.id,
      name: name.trim(),
      type,
      hebrewName: hebrewName.trim(),
      origin: origin.trim(),
      hebYear: hebYear.trim() ? Number(hebYear.trim()) : 0,
      locale,
    });
    setPending(false);
    if (!result.ok) {
      setError(
        result.error === "rate-limited"
          ? t.rateLimited
          : result.error === "name-required"
            ? t.nameRequired
            : t.error(result.error),
      );
      return;
    }
    onDone();
  };

  const field =
    "rounded-field border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20";
  const labelCls =
    "font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-subtle-foreground";

  return (
    <div className="flex flex-col gap-4 rounded-card border border-border bg-sunken p-4">
      <label className="flex flex-col gap-1.5">
        <span className={labelCls}>{t.name}</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`${field} font-display`}
        />
      </label>

      <div className="flex flex-col gap-1.5">
        <span className={labelCls}>{t.type}</span>
        <Segmented
          aria-label={t.type}
          tone={type === "yahrzeit" ? "yahrzeit" : "birthday"}
          value={type}
          onChange={setType}
          options={[
            { value: "birthday", label: t.types.birthday },
            { value: "yahrzeit", label: t.types.yahrzeit },
          ]}
        />
      </div>

      <label className="flex flex-col gap-1.5">
        <span className={labelCls}>
          {t.hebrewName}{" "}
          <span className="normal-case tracking-normal text-subtle-foreground/70">
            {t.optional}
          </span>
        </span>
        <input
          value={hebrewName}
          onChange={(e) => setHebrewName(e.target.value)}
          className={field}
          dir="rtl"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={labelCls}>
          {t.origin}{" "}
          <span className="normal-case tracking-normal text-subtle-foreground/70">
            {t.optional}
          </span>
        </span>
        <input
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          className={field}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={labelCls}>
          {t.hebYear}{" "}
          <span className="normal-case tracking-normal text-subtle-foreground/70">
            {t.optional}
          </span>
        </span>
        <input
          inputMode="numeric"
          value={hebYear}
          onChange={(e) => setHebYear(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="5754"
          className={`${field} w-32`}
          dir="ltr"
        />
      </label>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="rounded-field bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40"
        >
          {pending ? t.saving : t.save}
        </button>
        <button
          type="button"
          onClick={onDone}
          disabled={pending}
          className="rounded-field border border-border px-4 py-2 text-sm font-medium"
        >
          {t.cancel}
        </button>
      </div>
    </div>
  );
}
