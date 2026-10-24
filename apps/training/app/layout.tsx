/**
 * Root layout for Training. Loads the fonts (`next/font/google`), sets
 * `<html lang/dir>` before paint from the stored locale, and wraps the tree in
 * `<AuthProvider>` (Clerk) → `<Providers>` (i18n) → `<AppShell>` (header).
 */

import "./globals.css";

import type { Metadata } from "next";
import {
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  IBM_Plex_Sans_Hebrew,
  Newsreader,
  Noto_Serif_Hebrew,
} from "next/font/google";

import { AuthProvider } from "@repo/auth/provider";

import { AppShell } from "./components/AppShell";
import { Providers } from "./providers";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
});
const serifHe = Noto_Serif_Hebrew({
  subsets: ["hebrew"],
  variable: "--font-serif-he",
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
  title: `${ENV_TITLE_PREFIX}Training`,
  description: "Your question bank, generated exams and manual corrections.",
};

// Runs before paint: set <html lang/dir> from the stored / preferred language.
// Keep the key + locale list in sync with i18n/config.ts.
const LANG_INIT = `(function(){try{
  var l=localStorage.getItem('training.locale');
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
      className={`${newsreader.variable} ${serifHe.variable} ${plex.variable} ${plexHe.variable} ${plexMono.variable}`}
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
