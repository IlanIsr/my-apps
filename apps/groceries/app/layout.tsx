/**
 * Root layout for Groceries. Loads the fonts (`next/font/google`) and wraps
 * the tree in `<AuthProvider>` (Clerk) → `<Providers>` (i18n) → `<AppShell>`.
 */

import "./globals.css";

import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from "next/font/google";

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
  title: `${ENV_TITLE_PREFIX}Courses`,
  description: "Tickets de caisse, prix par magasin, liste de courses.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${bricolage.variable} ${inter.variable} ${mono.variable}`}
    >
      <body className="antialiased">
        <AuthProvider>
          <Providers>
            <AppShell>{children}</AppShell>
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
