/**
 * Locale constants. **Keep `LOCALES` + the storage key in sync with the inline
 * `<html lang/dir>` script in `layout.tsx`** — that script runs before this
 * module loads, so it can't import from here.
 */

/** The supported UI languages, in picker order. */
export const LOCALES = ["en", "he", "fr"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Text direction per locale. */
export const LOCALE_DIR: Record<Locale, "ltr" | "rtl"> = {
  en: "ltr",
  he: "rtl",
  fr: "ltr",
};

/** BCP-47 tag for `Intl` / `toLocaleDateString`. */
export const LOCALE_TAG: Record<Locale, string> = {
  en: "en-US",
  he: "he-IL",
  fr: "fr-FR",
};

/** Name of each language, written in that language (for the picker). */
export const LOCALE_LABEL: Record<Locale, string> = {
  en: "English",
  he: "עברית",
  fr: "Français",
};

/** Type guard: is `value` one of the supported locale codes? */
export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" && (LOCALES as readonly string[]).includes(value)
  );
}
