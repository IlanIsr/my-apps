"use client";

import type { LocationId, Minhag } from "@repo/hebcal";

import type { Locale } from "./config";
import { useLanguageContext } from "./language-context";

/**
 * Locale + direction + setter, plus the profile minhag (it picks the wording)
 * and city. For text, use `useTranslations()`.
 */
export function useLanguage(): {
  locale: Locale;
  dir: "ltr" | "rtl";
  setLocale: (locale: Locale) => void;
  minhag: Minhag | null;
  location: LocationId | null;
} {
  const { locale, dir, setLocale, minhag, location } = useLanguageContext();
  return { locale, dir, setLocale, minhag, location };
}
