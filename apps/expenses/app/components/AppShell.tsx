"use client";

/**
 * The page frame: the shared `AppHeader` (brand, section links, language,
 * account — one row, hamburger menu on mobile) above the content column.
 * Sits at the root of the client tree, so it reads its own texts.
 */

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { AuthControl } from "@repo/auth/nav";
import { AppHeader } from "@repo/ui/app-header";

import {
  LOCALE_LABEL,
  LOCALES,
  useLanguage,
  useTranslations,
  type Locale,
} from "@/i18n";

import { Select } from "./Select";

export type AppShellTexts = {
  brand: string;
  language: string;
  menu: string;
  nav: {
    expenses: string;
    receipts: string;
    products: string;
    shopping: string;
    stats: string;
    categories: string;
  };
};

const LINKS = [
  { href: "/", key: "expenses" },
  { href: "/receipts", key: "receipts" },
  { href: "/products", key: "products" },
  { href: "/shopping", key: "shopping" },
  { href: "/stats", key: "stats" },
  { href: "/categories", key: "categories" },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/" || pathname === "/import";
  // The stores page belongs to the products section.
  if (href === "/products" && pathname.startsWith("/stores")) return true;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations().appShell;
  const { locale, setLocale } = useLanguage();
  const pathname = usePathname();
  const { isSignedIn } = useAuth();

  return (
    <>
      <AppHeader
        brand={
          <Link
            href="/"
            className="flex items-center gap-2 font-display text-xl font-semibold"
          >
            <span
              aria-hidden
              className="grid size-7 place-items-center rounded-md bg-accent font-mono text-sm text-accent-ink"
            >
              ₪
            </span>
            {t.brand}
          </Link>
        }
        links={
          isSignedIn
            ? LINKS.map((link) => ({
                href: link.href,
                label: t.nav[link.key],
                active: isActive(pathname, link.href),
              }))
            : []
        }
        linkComponent={Link}
        settings={(placement) => (
          <Select
            aria-label={t.language}
            options={LOCALES.map((key) => ({ key, label: LOCALE_LABEL[key] }))}
            value={locale}
            onChange={(value) => setLocale(value as Locale)}
            className={placement === "bar" ? "w-32 text-sm" : "w-full text-sm"}
          />
        )}
        account={<AuthControl />}
        menuLabel={t.menu}
      />
      <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
    </>
  );
}
