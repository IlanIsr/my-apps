/**
 * Locale constants. French only for now — add a locale here, in every
 * `dictionaries/<locale>/`, and in `<html lang>` in
 * `app/layout.tsx` (plus an inline pre-paint script there once there are several).
 */

/** The supported UI languages, in picker order. */
export const LOCALES = ["fr"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "fr";

/** Text direction per locale. */
export const LOCALE_DIR: Record<Locale, "ltr" | "rtl"> = {
  fr: "ltr",
};

/** BCP-47 tag for `Intl` / `toLocaleDateString`. */
export const LOCALE_TAG: Record<Locale, string> = {
  fr: "fr-FR",
};

/** Type guard: is `value` one of the supported locale codes? */
export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" && (LOCALES as readonly string[]).includes(value)
  );
}
