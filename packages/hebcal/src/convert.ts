import { HDate, months } from "@hebcal/core";

/** The Hebrew month keys the UI offers, in display order. */
export const HEBREW_MONTH_KEYS = [
  "Tishrei",
  "Cheshvan",
  "Kislev",
  "Tevet",
  "Shvat",
  "Adar",
  "Adar1",
  "Adar2",
  "Nisan",
  "Iyyar",
  "Sivan",
  "Tamuz",
  "Av",
  "Elul",
] as const;

export type HebrewMonthKey = (typeof HEBREW_MONTH_KEYS)[number];

/**
 * Month key → canonical @hebcal/core month number.
 *
 * A regular Hebrew year has a single Adar (month 12). A leap year splits it into
 * Adar I (12) and Adar II (13). The plain "Adar" key maps to month 12, which
 * @hebcal renders as "Adar" in a regular year and "Adar I" in a leap year.
 */
const MONTH_NUMBER: Record<HebrewMonthKey, number> = {
  Tishrei: months.TISHREI,
  Cheshvan: months.CHESHVAN,
  Kislev: months.KISLEV,
  Tevet: months.TEVET,
  Shvat: months.SHVAT,
  Adar: months.ADAR_I,
  Adar1: months.ADAR_I,
  Adar2: months.ADAR_II,
  Nisan: months.NISAN,
  Iyyar: months.IYYAR,
  Sivan: months.SIVAN,
  Tamuz: months.TAMUZ,
  Av: months.AV,
  Elul: months.ELUL,
};

export type HebrewResult = {
  /** Gregorian date, at local midnight. */
  gregorian: Date;
  /** Rendered in Hebrew with gematriya, e.g. "ט״ו נִיסָן תשפ״ה". */
  hebrew: string;
  /** Transliterated, e.g. "15 Nisan 5785". */
  transliteration: string;
};

function toResult(hd: HDate): HebrewResult {
  return {
    gregorian: hd.greg(),
    hebrew: hd.renderGematriya(),
    transliteration: hd.toString(),
  };
}

/** Whether `monthKey` is a distinct month in the given Hebrew year. */
function monthExistsInYear(monthKey: string, year: number): boolean {
  // Adar I / Adar II are only distinct months in a leap year. In a regular year
  // the user should pick plain "Adar".
  if (monthKey === "Adar1" || monthKey === "Adar2") {
    return HDate.isLeapYear(year);
  }
  return true;
}

/**
 * The Gregorian date of an exact Hebrew date (day + month + year). Returns
 * `null` when it doesn't exist (e.g. the 30th of a 29-day month, or Adar I/II
 * in a non-leap year).
 */
export function hebrewDateToGregorian(
  day: number,
  monthKey: string,
  year: number,
): HebrewResult | null {
  if (!Number.isInteger(day) || day < 1 || day > 30) return null;
  if (!(monthKey in MONTH_NUMBER) || !Number.isInteger(year)) return null;
  const key = monthKey as HebrewMonthKey;
  if (!monthExistsInYear(key, year)) return null;

  const month = MONTH_NUMBER[key];
  if (day > HDate.daysInMonth(month, year)) return null;
  return toResult(new HDate(day, month, year));
}

/**
 * The Hebrew year a Gregorian date (1-based month) falls in. With
 * `afterNightfall`, the Hebrew day has already turned (e.g. the eve of Rosh
 * Hashana is in the new year).
 */
export function hebrewYearForGregorian(
  year: number,
  month: number,
  day: number,
  afterNightfall = false,
): number {
  const hd = new HDate(new Date(year, month - 1, day));
  return (afterNightfall ? hd.next() : hd).getFullYear();
}

/**
 * Convert a Gregorian date to its Hebrew equivalent. `monthIndex` is 0-based
 * (JS `Date` convention). `afterNightfall`: the Hebrew day starts at
 * nightfall, so it's the next Hebrew date. Returns `null` for dates that
 * don't exist (e.g. 30 February).
 */
export function calculateHebrewDate(
  day: number,
  monthIndex: number,
  year: number,
  afterNightfall = false,
): HebrewResult | null {
  const date = new Date(year, monthIndex, day);
  const isReal =
    date.getFullYear() === year &&
    date.getMonth() === monthIndex &&
    date.getDate() === day;
  if (!isReal) return null;

  const hd = new HDate(date);
  return toResult(afterNightfall ? hd.next() : hd);
}
