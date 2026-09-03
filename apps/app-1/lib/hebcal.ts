import { HDate, months } from "@hebcal/core";

/**
 * UI month keys → canonical @hebcal/core month numbers.
 *
 * A regular Hebrew year has a single Adar (month 12). A leap year splits it into
 * Adar I (12) and Adar II (13). The plain "Adar" key maps to month 12, which
 * @hebcal renders as "Adar" in a regular year and "Adar I" in a leap year.
 */
const MONTH_NUMBER: Record<string, number> = {
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

export type HebrewDateKey = keyof typeof MONTH_NUMBER;

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
 * Walk forward from today and return the next Gregorian date on which the given
 * Hebrew day + month falls. Returns `null` when the combination never occurs
 * (e.g. the 30th of a month that only ever has 29 days).
 */
export function findNextHebrewDate(
  day: number,
  monthKey: string,
): HebrewResult | null {
  if (!Number.isInteger(day) || day < 1 || day > 30) return null;
  if (!(monthKey in MONTH_NUMBER)) return null;

  const today = new HDate();
  const startYear = today.getFullYear();
  // A given day/month recurs at least once every 2-3 years, so a few hundred
  // years is a generous upper bound that also guarantees termination.
  const MAX_YEARS = 300;

  for (let year = startYear; year <= startYear + MAX_YEARS; year++) {
    if (!monthExistsInYear(monthKey, year)) continue;

    const month = MONTH_NUMBER[monthKey]!;
    if (day > HDate.daysInMonth(month, year)) continue;

    const candidate = new HDate(day, month, year);
    if (candidate.abs() >= today.abs()) {
      return toResult(candidate);
    }
  }

  return null;
}

/**
 * Convert a Gregorian date to its Hebrew equivalent. `monthIndex` is 0-based
 * (JS `Date` convention). Returns `null` for dates that don't exist
 * (e.g. 30 February).
 */
export function calculateHebrewDate(
  day: number,
  monthIndex: number,
  year: number,
): HebrewResult | null {
  const date = new Date(year, monthIndex, day);
  const isReal =
    date.getFullYear() === year &&
    date.getMonth() === monthIndex &&
    date.getDate() === day;
  if (!isReal) return null;

  return toResult(new HDate(date));
}
