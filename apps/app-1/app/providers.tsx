"use client";

import { ThemeProvider } from "next-themes";

import { I18nProvider } from "@/i18n";

/**
 * Client-side context providers wrapped around the whole app-1 tree (below
 * `<AuthProvider>`, which is in the layout): {@link I18nProvider} for the
 * hand-rolled i18n, and `next-themes` for class-based light/dark.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </I18nProvider>
  );
}
