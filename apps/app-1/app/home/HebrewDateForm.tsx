"use client";

import { useMemo, useState } from "react";

import {
  findNextHebrewDate,
  type HebrewMonthKey,
  type HebrewResult,
} from "@repo/hebcal";

import { LOCALE_TAG, useLanguage } from "@/i18n";
import { Button } from "../components/Button";
import { Select } from "../components/Select";
import { hebrewDayOptions, hebrewMonthOptions } from "./options";

export type HebrewDateFormTexts = {
  day: string;
  month: string;
  calculate: string;
  nextGregorianDate: string;
  noSuchDate: string;
  months: Record<HebrewMonthKey, string>;
};

export function HebrewDateForm({ t }: { t: HebrewDateFormTexts }) {
  const { locale } = useLanguage();
  const days = useMemo(() => hebrewDayOptions(locale), [locale]);
  const months = useMemo(() => hebrewMonthOptions(t.months), [t.months]);

  const [day, setDay] = useState("1");
  const [month, setMonth] = useState("Tishrei");
  const [result, setResult] = useState<HebrewResult | null>(null);
  const [notFound, setNotFound] = useState(false);

  const calculate = () => {
    const next = findNextHebrewDate(Number(day), month);
    setResult(next);
    setNotFound(next === null);
  };

  return (
    <div className="flex flex-col items-start gap-4">
      <div className="flex flex-wrap gap-4">
        <Select label={t.day} options={days} value={day} onChange={setDay} />
        <Select
          label={t.month}
          options={months}
          value={month}
          onChange={setMonth}
        />
      </div>

      <Button type="button" onClick={calculate}>
        {t.calculate}
      </Button>

      {result && (
        <p className="text-lg">
          {t.nextGregorianDate}{" "}
          <strong>
            {result.gregorian.toLocaleDateString(LOCALE_TAG[locale])}
          </strong>
          <span dir="ltr" className="block text-sm opacity-70">
            {result.transliteration}
          </span>
        </p>
      )}
      {notFound && <p className="text-sm opacity-70">{t.noSuchDate}</p>}
    </div>
  );
}
