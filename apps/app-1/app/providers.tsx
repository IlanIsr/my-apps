"use client";

import { ThemeProvider } from "next-themes";

import { I18nProvider } from "@/i18n";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </I18nProvider>
  );
}
