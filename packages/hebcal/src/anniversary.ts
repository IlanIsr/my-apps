import { HDate, months } from "@hebcal/core";

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
 * `"Adar"` → `"Adar"` (the single Adar of a regular year), `"Adar I"` →
 * `"Adar1"`, `"Adar II"` → `"Adar2"`.
 */
export function toHebrewMonthKey(name: string): string {
  const n = name.trim();
  const lower = n.toLowerCase();
  if (lower === "shvat" || lower === "sh'vat") return "Shvat";
  if (lower === "adar") return "Adar";
  if (lower === "adar i") return "Adar1";
  if (lower === "adar ii") return "Adar2";
  return n;
}

/**
 * Make a month key agree with a known Hebrew year: plain `"Adar"` in a leap
 * year means Adar I (`"Adar1"`), and `"Adar1"` / `"Adar2"` in a regular year
 * mean its single `"Adar"`. Without a year (or for any other month) the key is
 * returned unchanged.
 */
export function monthKeyForYear(monthKey: string, hebYear?: number | null) {
  if (!hebYear || !Number.isInteger(hebYear) || hebYear < 1) return monthKey;
  const adar = adarKind(monthKey);
  const leap = HDate.isLeapYear(hebYear);
  if (adar === "adar" && leap) return "Adar1";
  if ((adar === "adar1" || adar === "adar2") && !leap) return "Adar";
  return monthKey;
}

/** Birthdays and yahrzeits move differently when a month doesn't line up. */
export type AnniversaryKind = "birthday" | "yahrzeit";

/**
 * Custom for a yahrzeit of the single Adar in a leap year: Sephardim (Shulchan
 * Aruch) observe it in Adar II, Ashkenazim (Rema) in Adar I.
 */
export type Minhag = "sephardi" | "ashkenazi";

/** What, beyond the Hebrew day/month, decides when an anniversary falls. */
export type AnniversaryRule = {
  /** Default `"birthday"`. */
  kind?: AnniversaryKind;
  /** Default `"sephardi"`. Only affects a single-Adar yahrzeit. */
  minhag?: Minhag;
  /** Hebrew year of birth / death, if known (refines 30 Cheshvan / Kislev
   * yahrzeits). */
  originYear?: number | null;
};

/**
 * Which Adar a month key names. `"Adar"` is the single Adar of a regular year;
 * `"Adar1"` / `"Adar2"` are the two Adars of a leap year.
 */
function adarKind(monthKey: string): "adar" | "adar1" | "adar2" | null {
  const m = monthKey
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "");
  if (m === "adar") return "adar";
  if (m === "adari" || m === "adar1") return "adar1";
  if (m === "adarii" || m === "adar2") return "adar2";
  return null;
}

/**
 * The Hebrew date on which an anniversary of `hebDay` / `monthKey` falls in
 * `hebrewYear`, or `null` if it never can (30 Iyyar, 30 Adar II, …). Follows
 * `@hebcal/core`'s `getBirthdayOrAnniversary` / `getYahrzeit`, without needing
 * the original year — the month key carries what matters:
 *
 * - Single Adar (`"Adar"`, born/died in a regular year): in a leap year a
 *   birthday falls in Adar II; a yahrzeit too by default (Sephardi), or in
 *   Adar I with `minhag: "ashkenazi"` (what hebcal's `getYahrzeit` does).
 * - `"Adar1"`: Adar I in a leap year, Adar otherwise; its 30th, in a regular
 *   year, becomes 1 Nisan (birthday) / 30 Shvat (yahrzeit).
 * - `"Adar2"`: Adar II in a leap year, Adar otherwise.
 * - 30 Cheshvan / 30 Kislev in a year where the month has 29 days → 1 Kislev
 *   / 1 Tevet. For a yahrzeit whose first anniversary (`originYear + 1`) had
 *   no 30th, it's the month's last day every year instead — only applied when
 *   `originYear` (the Hebrew year of death) is known.
 */
export function anniversaryInYear(
  hebDay: number,
  monthKey: string,
  hebrewYear: number,
  { kind = "birthday", minhag = "sephardi", originYear }: AnniversaryRule = {},
): HDate | null {
  if (!Number.isInteger(hebDay) || hebDay < 1 || hebDay > 30) return null;
  const leap = HDate.isLeapYear(hebrewYear);
  const adar = adarKind(monthKey);

  let month: number;
  if (adar === "adar") {
    const second = kind === "birthday" || minhag === "sephardi";
    month = leap && second ? months.ADAR_II : months.ADAR_I;
  } else if (adar === "adar2") {
    month = leap ? months.ADAR_II : months.ADAR_I;
  } else if (adar === "adar1") {
    month = months.ADAR_I;
  } else {
    try {
      month = HDate.monthFromName(monthKey.trim());
    } catch {
      return null;
    }
  }

  if (
    kind === "yahrzeit" &&
    hebDay === 30 &&
    originYear &&
    (month === months.CHESHVAN || month === months.KISLEV) &&
    HDate.daysInMonth(month, originYear + 1) < 30
  ) {
    return new HDate(HDate.daysInMonth(month, hebrewYear), month, hebrewYear);
  }
  if (hebDay <= HDate.daysInMonth(month, hebrewYear)) {
    return new HDate(hebDay, month, hebrewYear);
  }
  // Only the 30th of a month that sometimes has 30 days rolls over; a 30th
  // that never exists (Iyyar, single Adar, Adar II, …) has no anniversary.
  if (adar === "adar1") {
    return kind === "yahrzeit"
      ? new HDate(30, months.SHVAT, hebrewYear)
      : new HDate(1, months.NISAN, hebrewYear);
  }
  if (month === months.CHESHVAN || month === months.KISLEV) {
    return new HDate(1, month + 1, hebrewYear);
  }
  return null;
}

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** An `HDate`'s Gregorian eve (the evening it begins), ISO `YYYY-MM-DD`. */
function eveISO(hd: HDate): string {
  const eve = hd.greg();
  eve.setDate(eve.getDate() - 1);
  return isoDate(eve);
}

/** The Gregorian eve (ISO) of an anniversary in `hebrewYear` — see {@link anniversaryInYear}. */
export function anniversaryEveInYear(
  hebDay: number,
  monthKey: string,
  hebrewYear: number,
  rule: AnniversaryRule = {},
): string | null {
  const hd = anniversaryInYear(hebDay, monthKey, hebrewYear, rule);
  return hd ? eveISO(hd) : null;
}

/** One future occurrence of a Hebrew day/month: its Hebrew year and the eve. */
export type HebrewOccurrence = {
  /** The Hebrew year the day/month falls in — a stable per-occurrence key. */
  hebrewYear: number;
  /** Gregorian eve of that occurrence, ISO `YYYY-MM-DD`. */
  date: string;
};

/**
 * The next `count` occurrences of an anniversary on a Hebrew day + month, each
 * with its Hebrew year and the Gregorian **eve** date (the Jewish day begins at
 * nightfall, so an anniversary "on" a Hebrew date is observed the preceding
 * evening). Only occurrences whose eve is today or later are returned.
 *
 * Adar and 30th-of-the-month rules per {@link anniversaryInYear}; years where
 * the date can't exist at all are skipped.
 */
export function calculateNextOccurrences(
  hebDay: number,
  hebMonth: string,
  count = 10,
  rule: AnniversaryRule = {},
): HebrewOccurrence[] {
  count = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  if (count === 0) return [];

  const today = new Date();
  const todayISO = isoDate(today);
  const currentHebrewYear = new HDate(today).getFullYear();

  const occurrences: HebrewOccurrence[] = [];
  const MAX_OFFSET = count + 15; // safety margin for skipped years

  for (
    let offset = 0;
    occurrences.length < count && offset <= MAX_OFFSET;
    offset++
  ) {
    const hebrewYear = currentHebrewYear + offset;
    const date = anniversaryEveInYear(hebDay, hebMonth, hebrewYear, rule);
    if (date && date >= todayISO) occurrences.push({ hebrewYear, date });
  }

  return occurrences;
}

/**
 * The next `count` Gregorian eve dates on which a Hebrew day + month recurs, as
 * ISO `YYYY-MM-DD` strings. See {@link calculateNextOccurrences}.
 */
export function calculateNextDates(
  hebDay: number,
  hebMonth: string,
  count = 10,
  rule: AnniversaryRule = {},
): string[] {
  return calculateNextOccurrences(hebDay, hebMonth, count, rule).map(
    (o) => o.date,
  );
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

/**
 * Gregorian date → Hebrew `{ day, month }` (month as an English name —
 * `"Adar"` in a regular year, `"Adar I"` / `"Adar II"` in a leap year). With
 * `afterNightfall`, the Hebrew day has already turned — the next Hebrew date.
 */
export function gregorianToHebrew(
  year: number,
  month: number,
  day: number,
  afterNightfall = false,
): { day: number; month: string } | null {
  try {
    const base = new HDate(new Date(year, month - 1, day));
    const hd = afterNightfall ? base.next() : base;
    const name =
      hd.getMonth() === months.ADAR_I && !hd.isLeapYear()
        ? "Adar"
        : (MONTH_NUM_TO_NAME[hd.getMonth()] ?? "Unknown");
    return { day: hd.getDate(), month: name };
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
