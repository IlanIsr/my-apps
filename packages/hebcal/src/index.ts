/**
 * `@repo/hebcal` — Hebrew ⇄ Gregorian date logic, wrapping `@hebcal/core`.
 *
 * Consumed as raw source (no build step). Its own tsconfig uses
 * `moduleResolution: "Bundler"`, so the relative imports below need no `.js`.
 *
 * - `convert`  — `findNextHebrewDate`, `hebrewYearForGregorian`,
 *   `calculateHebrewDate`, `HEBREW_MONTH_KEYS` / `HebrewMonthKey`.
 * - `anniversary` — `calculateNextOccurrences` (N future eves for a Hebrew
 *   day/month), `calculateNextDates`, `gregorianToHebrew`, `hebrewToGregorian`.
 * - `parse` — Gregorian/Hebrew date-string parsing.
 * - `zmanim` — `getTsetHakohavim*` (nightfall) from hebcal.com.
 */

export * from "./convert";
export * from "./anniversary";
export * from "./parse";
export * from "./zmanim";
