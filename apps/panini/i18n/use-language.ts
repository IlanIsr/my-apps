"use client";

import type { Locale } from "./config";
import { useLanguageContext } from "./language-context";

/** Locale + direction + setter. For text, use `useTranslations()`. */
export function useLanguage(): {
  locale: Locale;
  dir: "ltr" | "rtl";
  setLocale: (locale: Locale) => void;
} {
  const { locale, dir, setLocale } = useLanguageContext();
  return { locale, dir, setLocale };
}
