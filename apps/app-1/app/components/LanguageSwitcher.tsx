"use client";

import { LOCALE_LABEL, LOCALES, type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/context";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <select
      aria-label={t.language.label}
      value={locale}
      onChange={(event) => setLocale(event.target.value as Locale)}
      className="rounded-lg border border-foreground/20 bg-background px-2 py-1 text-sm outline-none focus:border-foreground/50"
    >
      {LOCALES.map((option) => (
        <option key={option} value={option}>
          {LOCALE_LABEL[option]}
        </option>
      ))}
    </select>
  );
}
