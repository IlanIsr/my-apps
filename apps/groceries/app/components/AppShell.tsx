"use client";

/**
 * The header (brand, section links, language, account) around every page —
 * one row; below `md` the links and language move into a hamburger menu.
 * Sits at the root of the client tree, so it reads its own texts.
 */

import { Show } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { AuthControl } from "@repo/auth/nav";

import {
  LOCALE_LABEL,
  LOCALES,
  useLanguage,
  useTranslations,
  type Locale,
} from "@/i18n";

import { Button } from "./Button";
import { Select } from "./Select";

export type AppShellTexts = {
  brand: string;
  language: string;
  menu: string;
  nav: {
    receipts: string;
    products: string;
    stores: string;
    shopping: string;
    stats: string;
  };
};

const LINKS = [
  { href: "/receipts", key: "receipts" },
  { href: "/products", key: "products" },
  { href: "/stores", key: "stores" },
  { href: "/shopping", key: "shopping" },
  { href: "/stats", key: "stats" },
] as const;

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations().appShell;
  const { locale, setLocale } = useLanguage();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = (onNavigate?: () => void) =>
    LINKS.map((link) => {
      const active = isActive(pathname, link.href);
      return (
        <Link
          key={link.href}
          href={link.href}
          onClick={onNavigate}
          aria-current={active ? "page" : undefined}
          className={`rounded-md px-3 py-1.5 whitespace-nowrap transition-colors ${
            active
              ? "bg-accent-soft font-medium text-accent"
              : "text-muted hover:bg-sunken hover:text-foreground"
          }`}
        >
          {t.nav[link.key]}
        </Link>
      );
    });

  const languageSelect = (className: string) => (
    <Select
      aria-label={t.language}
      options={LOCALES.map((key) => ({ key, label: LOCALE_LABEL[key] }))}
      value={locale}
      onChange={(value) => setLocale(value as Locale)}
      className={className}
    />
  );

  return (
    <>
      <header className="border-b border-line bg-surface/70 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-3">
          <Link
            href="/receipts"
            className="flex shrink-0 items-center gap-2 font-display text-xl font-semibold"
          >
            <span
              aria-hidden
              className="grid size-7 place-items-center rounded-md bg-accent font-mono text-sm text-accent-ink"
            >
              ₪
            </span>
            {t.brand}
          </Link>

          <Show when="signed-in">
            <nav className="hidden min-w-0 flex-1 gap-1 text-sm md:flex">
              {links()}
            </nav>
          </Show>

          <div className="ms-auto flex shrink-0 items-center gap-3">
            {languageSelect("hidden w-32 text-sm md:block")}
            <AuthControl />
            <Button
              variant="ghost"
              size="sm"
              isIconOnly
              aria-label={t.menu}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="md:hidden"
            >
              <span aria-hidden className="text-lg leading-none">
                {menuOpen ? "✕" : "☰"}
              </span>
            </Button>
          </div>
        </div>

        {menuOpen && (
          <div className="mx-auto flex max-w-3xl flex-col gap-3 border-t border-line px-4 py-3 md:hidden">
            <Show when="signed-in">
              <nav className="flex flex-col gap-1 text-sm">
                {links(() => setMenuOpen(false))}
              </nav>
            </Show>
            {languageSelect("w-full text-sm")}
          </div>
        )}
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
    </>
  );
}
