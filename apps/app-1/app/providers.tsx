"use client";

import { ThemeProvider } from "next-themes";

import type { Minhag } from "@repo/hebcal";

import { I18nProvider as AriaI18nProvider } from "@repo/ui/i18n-provider";

import { I18nProvider, LOCALE_TAG, useLanguage } from "@/i18n";

/** Hands the active locale to HeroUI / React Aria (direction, formatting). */
function AriaLocale({ children }: { children: React.ReactNode }) {
  const { locale } = useLanguage();
  return (
    <AriaI18nProvider locale={LOCALE_TAG[locale]}>{children}</AriaI18nProvider>
  );
}

/**
 * Client-side context providers wrapped around the whole app-1 tree (below
 * `<AuthProvider>`, which is in the layout): {@link I18nProvider} for the
 * hand-rolled i18n — mirrored into React Aria's locale so HeroUI components
 * follow the language and its direction — and `next-themes` for class-based
 * light/dark.
 */
export function Providers({
  minhag,
  children,
}: {
  minhag: Minhag | null;
  children: React.ReactNode;
}) {
  return (
    <I18nProvider minhag={minhag}>
      <AriaLocale>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </AriaLocale>
    </I18nProvider>
  );
}
