"use client";

import { useMemo, useState } from "react";

import { calculateHebrewDate, type HebrewResult } from "@repo/hebcal";

import { useLanguage } from "@/i18n";
import { Button } from "../components/Button";
import { Select } from "../components/Select";
import {
  gregorianDayOptions,
  gregorianMonthOptions,
  gregorianYearOptions,
} from "./options";

export type GregorianDateFormTexts = {
  day: string;
  month: string;
  year: string;
  calculate: string;
  invalidDate: string;
};

export function GregorianDateForm({ t }: { t: GregorianDateFormTexts }) {
  const { locale } = useLanguage();
  const days = useMemo(() => gregorianDayOptions(), []);
  const months = useMemo(() => gregorianMonthOptions(locale), [locale]);
  const years = useMemo(() => gregorianYearOptions(), []);

  const [day, setDay] = useState("1");
  const [month, setMonth] = useState("0");
  const [year, setYear] = useState(() => String(new Date().getFullYear()));
  const [result, setResult] = useState<HebrewResult | null>(null);
  const [invalid, setInvalid] = useState(false);

  const calculate = () => {
    const hd = calculateHebrewDate(Number(day), Number(month), Number(year));
    setResult(hd);
    setInvalid(hd === null);
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
        <p className="text-lg">
          <strong dir="rtl">{result.hebrew}</strong>
          <span dir="ltr" className="block text-sm opacity-70">
            {result.transliteration}
          </span>
        </p>
      )}
      {invalid && <p className="text-sm opacity-70">{t.invalidDate}</p>}
    </div>
  );
}
