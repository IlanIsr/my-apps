"use client";

/**
 * A person's Hebrew date, in the UI language: "יח חשוון" in Hebrew (day
 * numerals + Hebrew month name, right-to-left), the server's `label`
 * ("18 Cheshvan", left-to-right) otherwise. Inline — the surrounding block
 * keeps the page's alignment.
 */

import type { HebrewMonthKey } from "@repo/hebcal";

import { useLanguage } from "@/i18n";
import { hebrewMonths } from "@/i18n/dictionaries/he/hebrew-months";
import { HEBREW_DAY_LETTERS } from "@/lib/heb-date";

export function HebDate({
  hebDate,
  label,
}: {
  hebDate: { day: number; month: HebrewMonthKey };
  label: string;
}) {
  const { locale } = useLanguage();
  if (locale !== "he") return <span dir="ltr">{label}</span>;
  const day = HEBREW_DAY_LETTERS[hebDate.day - 1] ?? String(hebDate.day);
  return (
    <span>{`${day} ${hebrewMonths[hebDate.month] ?? hebDate.month}`}</span>
  );
}
