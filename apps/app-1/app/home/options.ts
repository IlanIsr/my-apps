/**
 * `<Select>` option builders shared by the converter forms and the anniversary
 * form: Hebrew / Gregorian day, month, and year lists. Month labels come from
 * the passed dictionary (Hebrew) or `Intl` (Gregorian) so there's little to
 * translate by hand.
 */

import { HEBREW_MONTH_KEYS, type HebrewMonthKey } from "@repo/hebcal";

import { LOCALE_TAG, type Locale } from "@/i18n";
import type { Option } from "../components/Select";

const HEBREW_DAY_LETTERS = [
  "א",
  "ב",
  "ג",
  "ד",
  "ה",
  "ו",
  "ז",
  "ח",
  "ט",
  "י",
  "יא",
  "יב",
  "יג",
  "יד",
  "טו",
  "טז",
  "יז",
  "יח",
  "יט",
  "כ",
  "כא",
  "כב",
  "כג",
  "כד",
  "כה",
  "כו",
  "כז",
  "כח",
  "כט",
  "ל",
];

/** Hebrew day 1–30: Hebrew numerals for `he`, plain digits otherwise. */
export function hebrewDayOptions(locale: Locale): Option[] {
  return Array.from({ length: 30 }, (_, i) => ({
    key: String(i + 1),
    label: locale === "he" ? HEBREW_DAY_LETTERS[i]! : String(i + 1),
  }));
}

/** The 14 Hebrew month keys in display order, labelled from `months`. */
export function hebrewMonthOptions(
  months: Record<HebrewMonthKey, string>,
): Option[] {
  return HEBREW_MONTH_KEYS.map((key) => ({ key, label: months[key] }));
}

/** Gregorian day 1–31 (plain digits). */
export function gregorianDayOptions(): Option[] {
  return Array.from({ length: 31 }, (_, i) => ({
    key: String(i + 1),
    label: String(i + 1),
  }));
}

/** Month names from `Intl`, so there's nothing to translate by hand. */
export function gregorianMonthOptions(locale: Locale): Option[] {
  const format = new Intl.DateTimeFormat(LOCALE_TAG[locale], { month: "long" });
  return Array.from({ length: 12 }, (_, i) => {
    const label = format.format(new Date(2000, i, 1));
    return {
      key: String(i),
      label: label.charAt(0).toUpperCase() + label.slice(1),
    };
  });
}

/** Gregorian years 1900–2100. */
export function gregorianYearOptions(): Option[] {
  return Array.from({ length: 2100 - 1900 + 1 }, (_, i) => {
    const year = String(1900 + i);
    return { key: year, label: year };
  });
}
