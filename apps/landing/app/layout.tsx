import type { Metadata } from "next";
import "./globals.css";

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
      <body className="antialiased">{children}</body>
    </html>
  );
}
