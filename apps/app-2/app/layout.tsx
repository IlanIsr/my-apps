/**
 * Root layout for app-2 — a placeholder app (its page just prints
 * `@repo/utils` output). Same Clerk `<AuthProvider>` gate as the others; a
 * Firestore feature is planned. Stays light (no theme toggle).
 */

import type { Metadata } from "next";
import "./globals.css";

import { AuthProvider } from "@repo/auth/provider";
import { AuthControl } from "@repo/auth/nav";

export const metadata: Metadata = {
  title: "App 2",
  description: "App 2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <header className="flex justify-end p-4">
            <AuthControl />
          </header>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
