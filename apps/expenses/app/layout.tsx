/**
 * Root layout for Expenses. Loads the fonts (`next/font/google`), sets
 * `<html lang/dir>` before paint from the stored locale, and wraps the tree in `<AuthProvider>` (Clerk) → `<Providers>` (i18n) → `<AppShell>`.
 */

import "./globals.css";

import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  Heebo,
  Inter,
  JetBrains_Mono,
} from "next/font/google";

import { AuthProvider } from "@repo/auth/provider";

import { AppShell } from "./components/AppShell";
import { Providers } from "./providers";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const heebo = Heebo({
  subsets: ["hebrew"],
  variable: "--font-heebo",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-face",
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
  title: `${ENV_TITLE_PREFIX}Expenses`,
  description:
    "Every expense — cash, card, grocery receipts — by category and month.",
};

// Runs before paint: set <html lang/dir> from the stored / preferred language.
// Keep the key + locale list in sync with i18n/config.ts.
const LANG_INIT = `(function(){try{
  var l=localStorage.getItem('expenses.locale');
  if(l!=='fr'&&l!=='en'&&l!=='he'){var n=navigator.language.slice(0,2);l=(n==='he'||n==='en')?n:'fr';}
  var d=document.documentElement;
  d.lang=l;d.dir=(l==='he')?'rtl':'ltr';
}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${bricolage.variable} ${inter.variable} ${heebo.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <script dangerouslySetInnerHTML={{ __html: LANG_INIT }} />
        <AuthProvider>
          <Providers>
            <AppShell>{children}</AppShell>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
