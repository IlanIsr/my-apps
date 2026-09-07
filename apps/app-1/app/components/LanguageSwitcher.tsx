"use client";

import { LOCALE_LABEL, LOCALES, type Locale } from "@/i18n";
import { useLanguage } from "@/i18n";

/**
 * `<select>` for the UI language (en/he/fr). Writing the locale via
 * {@link useLanguage} persists it to `localStorage` and updates `<html lang/dir>`.
 *
 * @param label - Accessible label (already translated by the caller).
 */
export function LanguageSwitcher({ label }: { label: string }) {
  const { locale, setLocale } = useLanguage();

  return (
    <select
      aria-label={label}
      value={locale}
      onChange={(event) => setLocale(event.target.value as Locale)}
      className="rounded-pill border border-border bg-card px-2 py-1 text-sm text-foreground outline-none focus:border-ring"
    >
      {LOCALES.map((option) => (
        <option key={option} value={option}>
          {LOCALE_LABEL[option]}
        </option>
      ))}
    </select>
  );
}
