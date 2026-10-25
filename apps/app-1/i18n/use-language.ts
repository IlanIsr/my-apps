"use client";

import type { Minhag } from "@repo/hebcal";

import type { Locale } from "./config";
import { useLanguageContext } from "./language-context";

/**
 * Locale + direction + setter, plus the profile minhag (it picks the wording).
 * For text, use `useTranslations()`.
 */
export function useLanguage(): {
  locale: Locale;
  dir: "ltr" | "rtl";
  setLocale: (locale: Locale) => void;
  minhag: Minhag | null;
} {
  const { locale, dir, setLocale, minhag } = useLanguageContext();
  return { locale, dir, setLocale, minhag };
}
