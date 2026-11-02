"use client";

/**
 * The header every app shares: one full-width row — brand at the start edge
 * (left, right in RTL), the section links centred, settings + account at the
 * end edge. Below `md` the links and settings move into a hamburger menu; the
 * brand and account stay in the row. Hidden when printing.
 *
 * Framework-agnostic: the app passes its router's link component (`next/link`)
 * and decides which links to show (e.g. none while signed out). Colours come
 * from HeroUI's variables (`--surface`, `--border`, `--muted`, `--accent`,
 * `--default`), themed per app.
 */

import { useState, type ComponentType, type ReactNode } from "react";

import { Button } from "@heroui/react/button";

export type AppHeaderLink = {
  href: string;
  label: ReactNode;
  /** The current section — highlighted, `aria-current="page"`. */
  active?: boolean;
};

type LinkProps = {
  href: string;
  className?: string;
  onClick?: () => void;
  "aria-current"?: "page";
  children?: ReactNode;
};

export type AppHeaderProps = {
  /** Usually a link home with the app's mark + name. */
  brand: ReactNode;
  links: AppHeaderLink[];
  /** The router's link component, e.g. `next/link`'s `Link`. */
  linkComponent: ComponentType<LinkProps>;
  /**
   * Preferences (language select, …). In the row on desktop, in the menu on
   * mobile — called once per place, so it can size itself for each.
   */
  settings?: (placement: "bar" | "menu") => ReactNode;
  /** Always in the row (e.g. the account avatar). */
  account?: ReactNode;
  /** Accessible name of the hamburger button. */
  menuLabel: string;
};

const LINK_BASE =
  "rounded-md px-3 py-1.5 whitespace-nowrap transition-colors hover:bg-[var(--default)] hover:text-[var(--foreground)]";
const LINK_ACTIVE =
  "bg-[color-mix(in_oklab,var(--accent)_14%,transparent)] font-medium text-[var(--accent)] hover:bg-[color-mix(in_oklab,var(--accent)_14%,transparent)] hover:text-[var(--accent)]";
const LINK_IDLE = "text-[var(--muted)]";

export function AppHeader({
  brand,
  links,
  linkComponent: Link,
  settings,
  account,
  menuLabel,
}: AppHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const renderLinks = (onNavigate?: () => void) =>
    links.map((link) => (
      <Link
        key={link.href}
        href={link.href}
        onClick={onNavigate}
        aria-current={link.active ? "page" : undefined}
        className={`${LINK_BASE} ${link.active ? LINK_ACTIVE : LINK_IDLE}`}
      >
        {link.label}
      </Link>
    ));

  return (
    <header className="border-b border-[var(--border)] bg-[color-mix(in_oklab,var(--surface)_70%,transparent)] backdrop-blur print:hidden">
      <div className="flex items-center gap-4 px-4 py-3">
        <div className="flex min-w-0 flex-1">{brand}</div>

        {links.length > 0 && (
          <nav className="hidden gap-1 text-sm md:flex">{renderLinks()}</nav>
        )}

        <div className="flex flex-1 items-center justify-end gap-3">
          {settings && <div className="hidden md:block">{settings("bar")}</div>}
          {account}
          <Button
            variant="ghost"
            size="sm"
            isIconOnly
            aria-label={menuLabel}
            aria-expanded={menuOpen}
            onPress={() => setMenuOpen((open) => !open)}
            className="md:hidden"
          >
            <span aria-hidden className="text-lg leading-none">
              {menuOpen ? "✕" : "☰"}
            </span>
          </Button>
        </div>
      </div>

      {menuOpen && (
        <div className="flex flex-col gap-3 border-t border-[var(--border)] px-4 py-3 md:hidden">
          {links.length > 0 && (
            <nav className="flex flex-col gap-1 text-sm">
              {renderLinks(() => setMenuOpen(false))}
            </nav>
          )}
          {settings?.("menu")}
        </div>
      )}
    </header>
  );
}
