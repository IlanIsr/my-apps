import "./globals.css";

import type { Metadata } from "next";
import {
  Assistant,
  Frank_Ruhl_Libre,
  JetBrains_Mono,
  Spectral,
} from "next/font/google";

import { AuthProvider } from "@repo/auth/provider";
import { getCurrentUserEmail } from "@repo/auth/user";
import { isAnniversariesAdmin } from "@repo/anniversaries";

import { Navbar } from "./components/Navbar";
import { Providers } from "./providers";

// Spectral (Latin serif) for names/dates/titles; Frank Ruhl Libre is its Hebrew
// counterpart — Spectral has no Hebrew glyphs, so Hebrew text in `font-display`
// falls through to it automatically. Assistant carries all UI text (Hebrew +
// Latin + French); JetBrains Mono is for eyebrows and counts.
const spectral = Spectral({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-spectral",
  display: "swap",
});
const frankRuhl = Frank_Ruhl_Libre({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-frank-ruhl",
  display: "swap",
});
const assistant = Assistant({
  subsets: ["hebrew", "latin"],
  variable: "--font-assistant",
  display: "swap",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const fontVars = `${spectral.variable} ${frankRuhl.variable} ${assistant.variable} ${jetbrainsMono.variable}`;

export const metadata: Metadata = {
  title: "Hebrew Anniversaries",
  description: "Hebrew-calendar anniversaries in your Google Calendar.",
};

// Runs before paint: set <html lang/dir> from the stored / preferred language
// so RTL layouts don't flash. Keep the key in sync with i18n/context.tsx.
const LANG_INIT = `(function(){try{
  var l=localStorage.getItem('app-1.locale');
  if(l!=='en'&&l!=='he'&&l!=='fr'){var n=navigator.language.slice(0,2);l=(n==='he'||n==='fr')?n:'en';}
  var d=document.documentElement;
  d.lang=l;d.dir=(l==='he')?'rtl':'ltr';
}catch(e){}})();`;

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const email = await getCurrentUserEmail();
  const isAdmin = email ? isAnniversariesAdmin(email) : false;

  return (
    <html lang="en" className={fontVars} suppressHydrationWarning>
      <body className="antialiased">
        <script dangerouslySetInnerHTML={{ __html: LANG_INIT }} />
        <AuthProvider>
          <Providers>
            <Navbar isAdmin={isAdmin} />
            <main className="mx-auto max-w-2xl px-6 py-12">{children}</main>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
