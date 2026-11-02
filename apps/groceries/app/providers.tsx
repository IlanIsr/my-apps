"use client";

import { I18nProvider as AriaI18nProvider } from "@repo/ui/i18n-provider";

import { I18nProvider, LOCALE_TAG, useLanguage } from "@/i18n";

/** Hands the active locale to HeroUI / React Aria (direction, formatting). */
function AriaLocale({ children }: { children: React.ReactNode }) {
  const { locale } = useLanguage();
  return (
    <AriaI18nProvider locale={LOCALE_TAG[locale]}>{children}</AriaI18nProvider>
  );
}

/** The hand-rolled i18n, mirrored into React Aria's locale. */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <AriaLocale>{children}</AriaLocale>
    </I18nProvider>
  );
}
