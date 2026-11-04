/**
 * Root layout for the translation workbench. Loads the fonts
 * (`next/font/google`), sets `<html lang/dir>` before paint from the stored
 * locale, and wraps the tree in `<AuthProvider>` (Clerk) → `<Providers>`
 * (i18n) → `<AppShell>` (header).
 */

import "./globals.css";

import type { Metadata } from "next";
import {
  Frank_Ruhl_Libre,
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  IBM_Plex_Sans_Hebrew,
  Source_Serif_4,
} from "next/font/google";
import Script from "next/script";

import { AuthProvider } from "@repo/auth/provider";

import { AppShell } from "./components/AppShell";
import { Providers } from "./providers";

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});
const frank = Frank_Ruhl_Libre({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-frank",
  display: "swap",
});
const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-plex",
  display: "swap",
});
const plexHe = IBM_Plex_Sans_Hebrew({
  subsets: ["hebrew"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-he",
  display: "swap",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
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
  title: `${ENV_TITLE_PREFIX}Atelier de traduction`,
  description:
    "Hebrew legal documents read, transcribed and translated by Claude, with the points to check flagged for the notary.",
};

// Runs before paint: set <html lang/dir> from the stored / preferred language.
// Keep the key + locale list in sync with i18n/config.ts.
const LANG_INIT = `(function(){try{
  var l=localStorage.getItem('translation.locale');
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
      className={`${sourceSerif.variable} ${frank.variable} ${plex.variable} ${plexHe.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        {/* `beforeInteractive`: inlined in the server HTML's <head>, run
            before hydration — a bare <script> errors when React re-renders
            the layout on the client. */}
        <Script id="lang-init" strategy="beforeInteractive">
          {LANG_INIT}
        </Script>
        <AuthProvider>
          <Providers>
            <AppShell>{children}</AppShell>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
