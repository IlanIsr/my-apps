"use client";

/**
 * The header (brand, section links, account) around every page. Sits at the
 * root of the client tree, so it reads its own texts.
 */

import { Show } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { AuthControl } from "@repo/auth/nav";

import { useTranslations } from "@/i18n";

export type AppShellTexts = {
  brand: string;
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

export function AppShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations().appShell;
  const pathname = usePathname();

  return (
    <>
      <header className="border-b border-line bg-surface/70 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link
            href="/receipts"
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

          <div className="ms-auto">
            <AuthControl />
          </div>

          <Show when="signed-in">
            <nav className="-mx-1 flex w-full gap-1 overflow-x-auto text-sm">
              {LINKS.map((link) => {
                const active =
                  pathname === link.href ||
                  pathname.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
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
              })}
            </nav>
          </Show>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
    </>
  );
}
