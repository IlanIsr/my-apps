"use client";

import { LOCALE_LABEL, LOCALES, type Locale } from "@/i18n";
import { useLanguage } from "@/i18n";

import { Select } from "./Select";

const OPTIONS = LOCALES.map((key) => ({ key, label: LOCALE_LABEL[key] }));

/**
 * Dropdown for the UI language (en/he/fr), on app-1's HeroUI-based
 * {@link Select}. Writing the locale via {@link useLanguage} persists it to
 * `localStorage` and updates `<html lang/dir>`.
 *
 * @param label - Accessible label (already translated by the caller).
 */
export function LanguageSwitcher({ label }: { label: string }) {
  const { locale, setLocale } = useLanguage();

  return (
    <Select
      label={label}
      hideLabel
      options={OPTIONS}
      value={locale}
      onChange={(value) => setLocale(value as Locale)}
      className="text-sm"
    />
  );
}
