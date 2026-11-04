"use client";

/**
 * The page frame: the shared `AppHeader` (brand, section links — one row,
 * hamburger menu on mobile) above the content column.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AppHeader } from "@repo/ui/app-header";

const LINKS = [
  { href: "/", label: "Jouer" },
  { href: "/scores", label: "Scores" },
  { href: "/regles", label: "Règles" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <AppHeader
        brand={
          <Link
            href="/"
            className="flex items-center gap-2 font-display text-xl font-bold"
          >
            <span
              aria-hidden
              className="grid size-7 place-items-center rounded-md bg-accent text-sm text-accent-ink"
            >
              ◆
            </span>
            Sournois
          </Link>
        }
        links={LINKS.map((link) => ({
          ...link,
          active: pathname === link.href,
        }))}
        linkComponent={Link}
        menuLabel="Menu"
      />
      <main className="mx-auto max-w-xl px-4 py-6">{children}</main>
    </>
  );
}
