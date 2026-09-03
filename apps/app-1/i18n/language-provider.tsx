"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";

import { DEFAULT_LOCALE, isLocale, LOCALE_DIR, type Locale } from "./config";
import { getDictionary } from "./dictionaries";
import {
  LanguageContext,
  type LanguageContextValue,
} from "./language-context";

const STORAGE_KEY = "app-1.locale";
const CHANGE_EVENT = "app-1:locale-change";

/** localStorage first, then the browser's preferred language, then the default. */
function readLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isLocale(stored)) return stored;
    const preferred = navigator.language.slice(0, 2);
    if (isLocale(preferred)) return preferred;
  } catch {
    // localStorage / navigator unavailable
  }
  return DEFAULT_LOCALE;
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(
    subscribe,
    readLocale,
    () => DEFAULT_LOCALE,
  );

  const setLocale = useCallback((next: Locale) => {
    localStorage.setItem(STORAGE_KEY, next);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  // The inline script in layout.tsx sets <html lang/dir> before paint; this
  // keeps it in sync on later changes.
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = LOCALE_DIR[locale];
  }, [locale]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      setLocale,
      messages: getDictionary(locale),
      dir: LOCALE_DIR[locale],
    }),
    [locale, setLocale],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
