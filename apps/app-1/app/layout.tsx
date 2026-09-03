import "./globals.css";

import type { Metadata } from "next";

import { Navbar } from "./components/Navbar";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Hebrew Date Converter",
  description: "Convert dates between the Hebrew and Gregorian calendars.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          <Navbar />
          <main className="mx-auto max-w-2xl px-6 py-12">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
