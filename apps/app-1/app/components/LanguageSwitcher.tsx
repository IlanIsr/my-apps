"use client";

import { LOCALE_LABEL, LOCALES, type Locale } from "@/i18n";
import { useLanguage } from "@/i18n";

export function LanguageSwitcher({ label }: { label: string }) {
  const { locale, setLocale } = useLanguage();

  return (
    <select
      aria-label={label}
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
