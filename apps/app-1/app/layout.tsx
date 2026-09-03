import "./globals.css";

import type { Metadata } from "next";

import { Navbar } from "./components/Navbar";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Hebrew Date Converter",
  description: "Convert dates between the Hebrew and Gregorian calendars.",
};

// Runs before paint: set <html lang/dir> from the stored / preferred language
// so RTL layouts don't flash. Keep the key in sync with i18n/context.tsx.
const LANG_INIT = `(function(){try{
  var l=localStorage.getItem('app-1.locale');
  if(l!=='en'&&l!=='he'&&l!=='fr'){var n=navigator.language.slice(0,2);l=(n==='he'||n==='fr')?n:'en';}
  var d=document.documentElement;
  d.lang=l;d.dir=(l==='he')?'rtl':'ltr';
}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <script dangerouslySetInnerHTML={{ __html: LANG_INIT }} />
        <Providers>
          <Navbar />
          <main className="mx-auto max-w-2xl px-6 py-12">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
