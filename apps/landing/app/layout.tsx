import type { Metadata } from "next";
import "./globals.css";

import { AuthProvider } from "@repo/auth/provider";
import { AuthControl } from "@repo/auth/nav";

export const metadata: Metadata = {
  title: "My Apps",
  description: "Landing page for my apps",
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
          <header className="mx-auto flex max-w-2xl items-center justify-end px-6 py-4">
            <AuthControl />
          </header>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
