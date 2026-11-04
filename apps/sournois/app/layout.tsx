/**
 * Root layout for Sournois (French only). Loads the fonts and wraps the tree
 * in `<AuthProvider>` (Clerk) → React Aria's locale (`fr-FR`) → `<AppShell>`.
 */

import "./globals.css";

import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";

import { AuthProvider } from "@repo/auth/provider";
import { I18nProvider } from "@repo/ui/i18n-provider";

import { AppShell } from "./components/AppShell";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});
const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
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
  title: `${ENV_TITLE_PREFIX}Sournois`,
  description:
    "Un jeu de mots où l'adversaire change de mot pour vous échapper.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${bricolage.variable} ${figtree.variable}`}>
      <body className="antialiased">
        <AuthProvider>
          <I18nProvider locale="fr-FR">
            <AppShell>{children}</AppShell>
          </I18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
