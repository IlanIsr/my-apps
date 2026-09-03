"use client";

import { useState } from "react";

import { Button } from "../components/Button";
import { Select } from "../components/Select";
import { findNextHebrewDate, type HebrewResult } from "@/lib/hebcal";
import { HEBREW_DAYS, HEBREW_MONTHS } from "./months";

export function HebrewDateForm() {
  const [day, setDay] = useState(HEBREW_DAYS[0]!.key);
  const [month, setMonth] = useState(HEBREW_MONTHS[0]!.key);
  const [result, setResult] = useState<HebrewResult | null>(null);
  const [notFound, setNotFound] = useState(false);

  const calculate = () => {
    const next = findNextHebrewDate(Number(day), month);
    setResult(next);
    setNotFound(next === null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div dir="rtl" className="flex flex-wrap gap-4">
        <Select
          label="יום"
          dir="rtl"
          options={HEBREW_DAYS}
          value={day}
          onChange={setDay}
        />
        <Select
          label="חודש"
          dir="rtl"
          options={HEBREW_MONTHS}
          value={month}
          onChange={setMonth}
        />
      </div>

      <Button type="button" onClick={calculate}>
        חשב
      </Button>

      {result && (
        <p className="text-lg">
          Next occurrence:{" "}
          <strong>{result.gregorian.toLocaleDateString()}</strong>
          <span className="block text-sm opacity-70">
            {result.transliteration}
          </span>
        </p>
      )}
      {notFound && (
        <p className="text-sm opacity-70">That Hebrew date doesn’t occur.</p>
      )}
    </div>
  );
}
