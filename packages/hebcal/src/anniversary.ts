import { HDate } from "@hebcal/core";

/**
 * Normalize a Hebrew month name to a form `@hebcal/core`'s `HDate` constructor
 * accepts. The constructor is already fairly tolerant (`"Adar1"`, `"Adar I"`,
 * `"Sh'vat"`, `"Shvat"` all work); this just tidies common variants.
 */
export function normalizeMonth(month: string): string {
  const m = month.trim().toLowerCase();
  if (m === "adar" || m === "adar i" || m === "adar1" || m === "adar_i") {
    return "Adar I";
  }
  if (m === "adar ii" || m === "adar2" || m === "adar_ii") return "Adar II";
  if (m === "shvat" || m === "sh'vat") return "Sh'vat";
  return month.trim();
}

function isLeapYear(hebrewYear: number): boolean {
  return new HDate(1, 1, hebrewYear).isLeapYear();
}

/**
 * Normalize a Hebrew month name (as `gregorianToHebrew` / hebcal return it) to
 * the key form used by `HEBREW_MONTH_KEYS` — `"Sh'vat"` → `"Shvat"`,
 * `"Adar I"` → `"Adar"`, `"Adar II"` → `"Adar2"`.
 */
export function toHebrewMonthKey(name: string): string {
  const n = name.trim();
  const lower = n.toLowerCase();
  if (lower === "shvat" || lower === "sh'vat") return "Shvat";
  if (lower === "adar" || lower === "adar i") return "Adar";
  if (lower === "adar ii") return "Adar2";
  return n;
}

/**
 * The next `count` Gregorian dates on which a Hebrew day + month recurs,
 * **shifted one day earlier** so a calendar event lands on the eve — the Jewish
 * day begins at nightfall, so an anniversary "on" a Hebrew date is observed the
 * preceding evening. Only dates today or later are returned.
 *
 * Returns ISO `YYYY-MM-DD` strings. Skips years where the date can't exist
 * (30th of a 29-day month, Adar II in a non-leap year, …).
 */
export function calculateNextDates(
  hebDay: number,
  hebMonth: string,
  count = 10,
): string[] {
  count = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  if (count === 0) return [];

  const month = normalizeMonth(hebMonth);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentHebrewYear = new HDate(today).getFullYear();

  const dates: string[] = [];
  const MAX_OFFSET = count + 15; // safety margin for skipped years

  for (
    let offset = 0;
    dates.length < count && offset <= MAX_OFFSET;
    offset++
  ) {
    const hebrewYear = currentHebrewYear + offset;
    if (month === "Adar II" && !isLeapYear(hebrewYear)) continue;

    try {
      // `new HDate(...)` clamps an over-long day to the month's last day, so
      // reject it explicitly (30th of a 29-day month, …).
      const monthNum = HDate.monthFromName(month);
      if (hebDay > HDate.daysInMonth(monthNum, hebrewYear)) continue;

      const greg = new HDate(hebDay, month, hebrewYear).greg();
      const eve = new Date(greg);
      eve.setDate(eve.getDate() - 1);

      if (eve >= today) {
        dates.push(
          `${eve.getFullYear()}-${String(eve.getMonth() + 1).padStart(2, "0")}-${String(eve.getDate()).padStart(2, "0")}`,
        );
      }
    } catch {
      // date doesn't exist this year — skip
    }
  }

  return dates;
}

const MONTH_NUM_TO_NAME: Record<number, string> = {
  1: "Nisan",
  2: "Iyyar",
  3: "Sivan",
  4: "Tamuz",
  5: "Av",
  6: "Elul",
  7: "Tishrei",
  8: "Cheshvan",
  9: "Kislev",
  10: "Tevet",
  11: "Sh'vat",
  12: "Adar I",
  13: "Adar II",
};

/** Gregorian date → Hebrew `{ day, month }` (month as an English name). */
export function gregorianToHebrew(
  year: number,
  month: number,
  day: number,
): { day: number; month: string } | null {
  try {
    const hd = new HDate(new Date(year, month - 1, day));
    return {
      day: hd.getDate(),
      month: MONTH_NUM_TO_NAME[hd.getMonth()] ?? "Unknown",
    };
  } catch {
    return null;
  }
}

/**
 * Hebrew date → the earliest Gregorian date it fell on (i.e. a birth date),
 * searched between `minYear` and today. Returns ISO `YYYY-MM-DD`.
 */
export function hebrewToGregorian(
  hebDay: number,
  hebMonth: string,
  minYear = 1900,
): string | null {
  const month = normalizeMonth(hebMonth);
  const currentYear = new Date().getFullYear();

  let earliest: Date | null = null;

  for (let year = minYear; year <= currentYear; year++) {
    try {
      const hebrewYear = new HDate(new Date(year, 0, 1)).getFullYear();
      if (month === "Adar II" && !isLeapYear(hebrewYear)) continue;

      const greg = new HDate(hebDay, month, hebrewYear).greg();
      if (greg.getFullYear() >= minYear && greg.getFullYear() <= currentYear) {
        if (!earliest || greg < earliest) earliest = greg;
      }
    } catch {
      // skip
    }
  }

  if (!earliest) return null;
  return `${earliest.getFullYear()}-${String(earliest.getMonth() + 1).padStart(2, "0")}-${String(earliest.getDate()).padStart(2, "0")}`;
}
