"use client";

import { useState } from "react";

import { Button } from "../components/Button";
import { Select } from "../components/Select";
import { calculateHebrewDate, type HebrewResult } from "@/lib/hebcal";
import { GREGORIAN_DAYS, GREGORIAN_MONTHS, GREGORIAN_YEARS } from "./months";

export function GregorianDateForm() {
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-4">
        <Select
          label="Day"
          options={GREGORIAN_DAYS}
          value={day}
          onChange={setDay}
        />
        <Select
          label="Month"
          options={GREGORIAN_MONTHS}
          value={month}
          onChange={setMonth}
        />
        <Select
          label="Year"
          options={GREGORIAN_YEARS}
          value={year}
          onChange={setYear}
        />
      </div>

      <Button type="button" onClick={calculate}>
        Calculate
      </Button>

      {result && (
        <p className="text-lg">
          <strong dir="rtl">{result.hebrew}</strong>
          <span className="block text-sm opacity-70">
            {result.transliteration}
          </span>
        </p>
      )}
      {invalid && <p className="text-sm opacity-70">That’s not a valid date.</p>}
    </div>
  );
}
