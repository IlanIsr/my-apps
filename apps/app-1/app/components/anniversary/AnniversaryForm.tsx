"use client";

/**
 * The "Add an anniversary" form (`/anniversaries/new`). Collects a name, type
 * (birthday / yahrzeit), a Hebrew date — entered directly or converted from a
 * Gregorian one — an optional Hebrew year, and how many years ahead to
 * create. On submit it calls {@link addAnniversaryAction}; the backend either
 * creates the person or, if one already matches, adds you and tops up
 * missing years. Sharing with others happens afterward, via a share link
 * generated from {@link CreateShareLinkModal}.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  gregorianToHebrew,
  hebrewYearForGregorian,
  toHebrewMonthKey,
  type HebrewMonthKey,
} from "@repo/hebcal";
import type { AnniversaryType } from "@repo/anniversaries/person";
import { resolveErrorMessage } from "@repo/utils";

import { useLanguage } from "@/i18n";
import { Button } from "../Button";
import { Checkbox } from "../Checkbox";
import { Segmented } from "../Segmented";
import { Select } from "../Select";
import { TextInput } from "../TextInput";
import {
  gregorianDayOptions,
  gregorianMonthOptions,
  gregorianYearOptions,
  hebrewDayOptions,
  hebrewMonthOptions,
} from "../../home/options";
import { addAnniversaryAction } from "../../anniversaries/actions";

/** Text for {@link AnniversaryForm} — every label, hint, and error string. */
export type AnniversaryFormTexts = {
  name: string;
  namePlaceholder: string;
  type: string;
  types: { birthday: string; yahrzeit: string };
  hebDate: string;
  calendar: string;
  day: string;
  month: string;
  year: string;
  afterNightfall: string;
  hebYear: string;
  optional: string;
  years: string;
  submit: string;
  submitting: string;
  cancel: string;
  toggle: { hebrew: string; gregorian: string; aria: string };
  nameRequired: string;
  notConfigured: string;
  noSuchDate: string;
  rateLimited: string;
  error: (message: string) => string;
  months: Record<HebrewMonthKey, string>;
};

export function AnniversaryForm({ t }: { t: AnniversaryFormTexts }) {
  const { locale } = useLanguage();
  const router = useRouter();

  const months = useMemo(() => hebrewMonthOptions(t.months), [t.months]);
  const days = useMemo(() => hebrewDayOptions(locale), [locale]);
  const gregDays = useMemo(() => gregorianDayOptions(), []);
  const gregMonths = useMemo(() => gregorianMonthOptions(locale), [locale]);
  const gregYears = useMemo(() => gregorianYearOptions(), []);

  const [name, setName] = useState("");
  const [type, setType] = useState<AnniversaryType>("birthday");
  const [fromGregorian, setFromGregorian] = useState(false);
  const [day, setDay] = useState("1");
  const [month, setMonth] = useState("Tishrei");
  const [hebYear, setHebYear] = useState("");
  const [gDay, setGDay] = useState("1");
  const [gMonth, setGMonth] = useState("0");
  const [gYear, setGYear] = useState(() => String(new Date().getFullYear()));
  const [afterNightfall, setAfterNightfall] = useState(false);
  const [years, setYears] = useState("20");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const yearOptions = [5, 10, 15, 20, 30, 50].map((n) => ({
    key: String(n),
    label: String(n),
  }));

  const converted = useMemo(() => {
    if (!fromGregorian) return null;
    return gregorianToHebrew(
      Number(gYear),
      Number(gMonth) + 1,
      Number(gDay),
      afterNightfall,
    );
  }, [fromGregorian, gYear, gMonth, gDay, afterNightfall]);

  const yahrzeit = type === "yahrzeit";
  const tone = yahrzeit ? "yahrzeit" : "birthday";

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError(t.nameRequired);
      return;
    }

    const hebDay = converted ? converted.day : Number(day);
    const hebMonth = converted ? toHebrewMonthKey(converted.month) : month;

    // Hebrew year: derived from the Gregorian date, or the optional field.
    const hebYearValue = fromGregorian
      ? hebrewYearForGregorian(
          Number(gYear),
          Number(gMonth) + 1,
          Number(gDay),
          afterNightfall,
        )
      : hebYear.trim()
        ? Number(hebYear.trim())
        : undefined;

    setPending(true);
    const result = await addAnniversaryAction({
      name: name.trim(),
      type,
      hebDay,
      hebMonth,
      hebYear:
        hebYearValue && Number.isFinite(hebYearValue)
          ? hebYearValue
          : undefined,
      years: Number(years),
      locale,
    });
    setPending(false);

    if (!result.ok) {
      setError(
        resolveErrorMessage(
          result.error,
          {
            "not-configured": t.notConfigured,
            "db-not-configured": t.notConfigured,
            "no-such-date": t.noSuchDate,
            "rate-limited": t.rateLimited,
          },
          t.error,
        ),
      );
      return;
    }
    router.push("/anniversaries");
  };

  const label =
    "font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-subtle-foreground";

  return (
    <form onSubmit={submit} className="flex max-w-md flex-col gap-5">
      <label className="flex flex-col gap-1.5">
        <span className={label}>{t.name}</span>
        <TextInput
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.namePlaceholder}
          className="font-display text-base"
        />
      </label>

      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-1.5">
          <span className={label}>{t.type}</span>
          <Segmented
            aria-label={t.type}
            tone={tone}
            value={type}
            onChange={setType}
            options={[
              { value: "birthday", label: t.types.birthday },
              { value: "yahrzeit", label: t.types.yahrzeit },
            ]}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className={label}>{t.calendar}</span>
          <Segmented
            aria-label={t.toggle.aria}
            value={fromGregorian ? "gregorian" : "hebrew"}
            onChange={(v) => setFromGregorian(v === "gregorian")}
            options={[
              { value: "hebrew", label: t.toggle.hebrew },
              { value: "gregorian", label: t.toggle.gregorian },
            ]}
          />
        </div>
      </div>

      {fromGregorian ? (
        <>
          <div className="flex flex-wrap gap-3">
            <Select
              label={t.day}
              options={gregDays}
              value={gDay}
              onChange={setGDay}
            />
            <Select
              label={t.month}
              options={gregMonths}
              value={gMonth}
              onChange={setGMonth}
            />
            <Select
              label={t.year}
              options={gregYears}
              value={gYear}
              onChange={setGYear}
            />
          </div>
          <Checkbox
            checked={afterNightfall}
            onChange={setAfterNightfall}
            className="flex items-center gap-2 text-sm"
          >
            {t.afterNightfall}
          </Checkbox>
          {converted && (
            <p className="text-sm text-muted-foreground">
              {t.hebDate}: {converted.day}{" "}
              <span dir="ltr">{converted.month}</span>
            </p>
          )}
        </>
      ) : (
        <>
          <div
            className="flex flex-wrap gap-3"
            dir={locale === "he" ? "rtl" : "ltr"}
          >
            <Select
              label={t.day}
              options={days}
              value={day}
              onChange={setDay}
            />
            <Select
              label={t.month}
              options={months}
              value={month}
              onChange={setMonth}
            />
            <label className="flex flex-col gap-1.5">
              <span className={label}>
                {t.hebYear}{" "}
                <span className="normal-case tracking-normal text-subtle-foreground/70">
                  {t.optional}
                </span>
              </span>
              <TextInput
                inputMode="numeric"
                value={hebYear}
                onChange={(e) =>
                  setHebYear(e.target.value.replace(/[^0-9]/g, ""))
                }
                placeholder="5754"
                className="w-32"
                dir="ltr"
              />
            </label>
          </div>
        </>
      )}

      <Select
        label={t.years}
        options={yearOptions}
        value={years}
        onChange={setYears}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center gap-2 pt-1">
        <Button type="submit" disabled={pending}>
          {pending ? t.submitting : t.submit}
        </Button>
        <Link
          href="/anniversaries"
          className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          {t.cancel}
        </Link>
      </div>
    </form>
  );
}
