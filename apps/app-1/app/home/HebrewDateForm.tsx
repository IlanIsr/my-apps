"use client";

import { useMemo, useState } from "react";

import {
  hebrewDateToGregorian,
  hebrewYearForGregorian,
  type HebrewMonthKey,
  type HebrewResult,
} from "@repo/hebcal";

import { LOCALE_TAG, useLanguage } from "@/i18n";
import { Button } from "../components/Button";
import { Ornament } from "../components/Ornament";
import { Select } from "../components/Select";
import {
  hebrewDayOptions,
  hebrewMonthOptions,
  hebrewYearOptions,
} from "./options";

/**
 * Pick a Hebrew day + month + year; shows the Gregorian date it falls on (via
 * `hebrewDateToGregorian` from `@repo/hebcal`). The year defaults to this one.
 */

/** Text for {@link HebrewDateForm}. */
export type HebrewDateFormTexts = {
  day: string;
  month: string;
  year: string;
  calculate: string;
  gregorianDate: string;
  noSuchDate: string;
  months: Record<HebrewMonthKey, string>;
};

export function HebrewDateForm({ t }: { t: HebrewDateFormTexts }) {
  const { locale } = useLanguage();
  const days = useMemo(() => hebrewDayOptions(locale), [locale]);
  const months = useMemo(() => hebrewMonthOptions(t.months), [t.months]);
  const years = useMemo(() => hebrewYearOptions(), []);

  const [day, setDay] = useState("1");
  const [month, setMonth] = useState("Tishrei");
  const [year, setYear] = useState(() => {
    const today = new Date();
    return String(
      hebrewYearForGregorian(
        today.getFullYear(),
        today.getMonth() + 1,
        today.getDate(),
      ),
    );
  });
  const [result, setResult] = useState<HebrewResult | null>(null);
  const [notFound, setNotFound] = useState(false);

  const calculate = () => {
    const date = hebrewDateToGregorian(Number(day), month, Number(year));
    setResult(date);
    setNotFound(date === null);
  };

  return (
    <div className="flex flex-col items-start gap-4">
      <div className="flex flex-wrap gap-3">
        <Select label={t.day} options={days} value={day} onChange={setDay} />
        <Select
          label={t.month}
          options={months}
          value={month}
          onChange={setMonth}
        />
        <Select
          label={t.year}
          options={years}
          value={year}
          onChange={setYear}
        />
      </div>

      <Button type="button" onClick={calculate}>
        {t.calculate}
      </Button>

      {result && (
        <div className="w-full max-w-sm rounded-card border border-border bg-card p-5 text-center shadow-sm">
          <div className="font-mono text-[10.5px] tracking-[0.12em] text-subtle-foreground uppercase">
            {t.gregorianDate}
          </div>
          <div className="mt-1.5 font-display text-2xl text-card-foreground">
            {result.gregorian.toLocaleDateString(LOCALE_TAG[locale])}
          </div>
          <div dir="ltr" className="mt-1 font-display text-sm text-birthday">
            {result.transliteration}
          </div>
          <Ornament className="mt-3" />
        </div>
      )}
      {notFound && (
        <p className="text-sm text-muted-foreground">{t.noSuchDate}</p>
      )}
    </div>
  );
}
