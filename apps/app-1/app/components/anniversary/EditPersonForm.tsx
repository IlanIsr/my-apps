"use client";

/**
 * "Edit details" panel on the anniversary detail page: name, Hebrew date
 * (entered directly or converted from a Gregorian one, same as the add form),
 * Hebrew name, Hebrew year. Calls {@link updatePersonAction}. A name or Hebrew
 * date change recomputes the dedup key; a date change also regenerates every
 * stored occurrence at the new date. Either re-syncs the calendar. Type isn't
 * editable here; hebrewName / hebYear are store-only.
 */

import { useMemo, useState } from "react";

import {
  gregorianToHebrew,
  hebrewYearForGregorian,
  toHebrewMonthKey,
  type HebrewMonthKey,
} from "@repo/hebcal";
import { useLanguage } from "@/i18n";
import { Button } from "../Button";
import { TextInput } from "../TextInput";
import type { Anniversary } from "@repo/anniversaries/person";
import { resolveErrorMessage } from "@repo/utils";
import { updatePersonAction } from "../../anniversaries/actions";
import {
  gregorianDayOptions,
  gregorianMonthOptions,
  gregorianYearOptions,
  hebrewDayOptions,
  hebrewMonthOptions,
} from "../../home/options";
import { Segmented } from "../Segmented";
import { Select } from "../Select";

/** Text for {@link EditPersonForm}. */
export type EditPersonFormTexts = {
  name: string;
  hebDate: string;
  calendar: string;
  day: string;
  month: string;
  year: string;
  hebrewName: string;
  hebYear: string;
  optional: string;
  save: string;
  saving: string;
  cancel: string;
  toggle: { hebrew: string; gregorian: string; aria: string };
  nameRequired: string;
  noSuchDate: string;
  rateLimited: string;
  error: (message: string) => string;
  months: Record<HebrewMonthKey, string>;
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
  const months = useMemo(() => hebrewMonthOptions(t.months), [t.months]);
  const days = useMemo(() => hebrewDayOptions(locale), [locale]);
  const gregDays = useMemo(() => gregorianDayOptions(), []);
  const gregMonths = useMemo(() => gregorianMonthOptions(locale), [locale]);
  const gregYears = useMemo(() => gregorianYearOptions(), []);

  const [name, setName] = useState(anniversary.name);
  const [fromGregorian, setFromGregorian] = useState(false);
  const [day, setDay] = useState(String(anniversary.hebDate.day));
  const [month, setMonth] = useState<string>(anniversary.hebDate.month);
  const [gDay, setGDay] = useState("1");
  const [gMonth, setGMonth] = useState("0");
  const [gYear, setGYear] = useState(() => String(new Date().getFullYear()));
  const [hebrewName, setHebrewName] = useState(anniversary.hebrewName ?? "");
  const [hebYear, setHebYear] = useState(
    anniversary.hebYear ? String(anniversary.hebYear) : "",
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const converted = useMemo(() => {
    if (!fromGregorian) return null;
    return gregorianToHebrew(Number(gYear), Number(gMonth) + 1, Number(gDay));
  }, [fromGregorian, gYear, gMonth, gDay]);

  const save = async () => {
    if (!name.trim()) {
      setError(t.nameRequired);
      return;
    }

    const hebDay = converted ? converted.day : Number(day);
    const hebMonth = converted ? toHebrewMonthKey(converted.month) : month;
    const hebYearValue = fromGregorian
      ? hebrewYearForGregorian(Number(gYear), Number(gMonth) + 1, Number(gDay))
      : hebYear.trim()
        ? Number(hebYear.trim())
        : 0;

    setPending(true);
    setError(null);
    const result = await updatePersonAction({
      id: anniversary.id,
      name: name.trim(),
      type: anniversary.type,
      hebDay,
      hebMonth,
      hebrewName: hebrewName.trim(),
      hebYear: hebYearValue,
      locale,
    });
    setPending(false);
    if (!result.ok) {
      setError(
        resolveErrorMessage(
          result.error,
          {
            "rate-limited": t.rateLimited,
            "name-required": t.nameRequired,
            "no-such-date": t.noSuchDate,
          },
          t.error,
        ),
      );
      return;
    }
    onDone();
  };

  const labelCls =
    "font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-subtle-foreground";

  return (
    <div className="flex flex-col gap-4 rounded-card border border-border bg-sunken p-4">
      <label className="flex flex-col gap-1.5">
        <span className={labelCls}>{t.name}</span>
        <TextInput
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="font-display"
        />
      </label>

      <div className="flex flex-col gap-1.5">
        <span className={labelCls}>{t.calendar}</span>
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

      {fromGregorian ? (
        <div className="flex flex-wrap items-end gap-3">
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
          {converted && (
            <p className="pb-2.5 text-sm text-muted-foreground">
              {t.hebDate}: {converted.day}{" "}
              <span dir="ltr">{converted.month}</span>
            </p>
          )}
        </div>
      ) : (
        <div
          className="flex flex-wrap gap-3"
          dir={locale === "he" ? "rtl" : "ltr"}
        >
          <Select label={t.day} options={days} value={day} onChange={setDay} />
          <Select
            label={t.month}
            options={months}
            value={month}
            onChange={setMonth}
          />
          <label className="flex flex-col gap-1.5">
            <span className={labelCls}>
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
      )}

      <label className="flex flex-col gap-1.5">
        <span className={labelCls}>
          {t.hebrewName}{" "}
          <span className="normal-case tracking-normal text-subtle-foreground/70">
            {t.optional}
          </span>
        </span>
        <TextInput
          value={hebrewName}
          onChange={(e) => setHebrewName(e.target.value)}
          dir="rtl"
        />
      </label>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button onClick={save} disabled={pending}>
          {pending ? t.saving : t.save}
        </Button>
        <Button onClick={onDone} disabled={pending} variant="outline">
          {t.cancel}
        </Button>
      </div>
    </div>
  );
}
