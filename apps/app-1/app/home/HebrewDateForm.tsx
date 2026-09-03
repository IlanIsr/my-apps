"use client";

import { useMemo, useState } from "react";

import { LOCALE_TAG } from "@/i18n/config";
import { useI18n } from "@/i18n/context";
import { findNextHebrewDate, type HebrewResult } from "@repo/hebcal";
import { Button } from "../components/Button";
import { Select } from "../components/Select";
import { hebrewDayOptions, hebrewMonthOptions } from "./options";

export function HebrewDateForm() {
  const { t, locale } = useI18n();
  const days = useMemo(() => hebrewDayOptions(locale), [locale]);
  const months = useMemo(() => hebrewMonthOptions(t), [t]);

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
        <Select
          label={t.hebrewForm.day}
          options={days}
          value={day}
          onChange={setDay}
        />
        <Select
          label={t.hebrewForm.month}
          options={months}
          value={month}
          onChange={setMonth}
        />
      </div>

      <Button type="button" onClick={calculate}>
        {t.hebrewForm.calculate}
      </Button>

      {result && (
        <p className="text-lg">
          {t.hebrewForm.nextGregorianDate}{" "}
          <strong>
            {result.gregorian.toLocaleDateString(LOCALE_TAG[locale])}
          </strong>
          <span dir="ltr" className="block text-sm opacity-70">
            {result.transliteration}
          </span>
        </p>
      )}
      {notFound && (
        <p className="text-sm opacity-70">{t.hebrewForm.noSuchDate}</p>
      )}
    </div>
  );
}
