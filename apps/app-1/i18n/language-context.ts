"use client";

/**
 * The React context {@link I18nProvider} fills and the `use-language` /
 * `use-translations` hooks read. Not exported from the `@/i18n` barrel — use
 * those hooks instead.
 */

import { createContext, useContext } from "react";

import type { LocationId, Minhag } from "@repo/hebcal";

import type { Locale } from "./config";
import type { Messages } from "./messages";

export type LanguageContextValue = {
  locale: Locale;
  dir: "ltr" | "rtl";
  messages: Messages;
  /** The signed-in user's profile minhag (`null` = never chosen). */
  minhag: Minhag | null;
  /** The signed-in user's profile city (`null` = never chosen ≈ Jerusalem). */
  location: LocationId | null;
  setLocale: (locale: Locale) => void;
};

export const LanguageContext = createContext<LanguageContextValue | null>(null);

export function useLanguageContext(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguageContext must be used within <I18nProvider>");
  }
  return context;
}
