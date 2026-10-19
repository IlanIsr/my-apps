/**
 * Root layout for Panini. Loads the fonts (`next/font/google`), sets
 * `<html lang>` before paint from the stored locale, and wraps the tree in
 * `<AuthProvider>` (Clerk) → `<I18nProvider>`.
 */

import "./globals.css";

import type { Metadata } from "next";
import { Figtree, Fraunces, JetBrains_Mono } from "next/font/google";

import { AuthControl } from "@repo/auth/nav";
import { AuthProvider } from "@repo/auth/provider";

import { I18nProvider } from "@/i18n";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});
const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

// Non-prod deploys get a tab-title prefix so they're obvious next to prod.
const ENV_TITLE_PREFIX =
  process.env.VERCEL_ENV === "preview"
    ? "[preprod] "
    : process.env.VERCEL_ENV === "production"
      ? ""
      : "[dev] ";

export const metadata: Metadata = {
  title: `${ENV_TITLE_PREFIX}Classeur Panini`,
  description:
    "Qui a quelle carte, les doublons à échanger et les pages à finir.",
};

// Runs before paint: set <html lang/dir> from the stored / preferred language.
// Keep the key + locale list in sync with i18n/config.ts.
const LANG_INIT = `(function(){try{
  var l=localStorage.getItem('panini.locale');
  if(l!=='fr'){l='fr';}
  var d=document.documentElement;
  d.lang=l;d.dir='ltr';
}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${fraunces.variable} ${figtree.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <script dangerouslySetInnerHTML={{ __html: LANG_INIT }} />
        <AuthProvider>
          <I18nProvider>
            <header className="flex justify-end px-4 pt-4">
              <AuthControl />
            </header>
            {children}
          </I18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
