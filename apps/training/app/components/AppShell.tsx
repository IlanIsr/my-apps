"use client";

/**
 * The header (brand, section links, language, account) around every page.
 * Sits at the root of the client tree, so it reads its own texts. Hidden when
 * printing.
 */

import { Show } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { AuthControl } from "@repo/auth/nav";

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
  nav: { questions: string; newExam: string; history: string; stats: string };
};

const LINKS = [
  { href: "/exams/new", key: "newExam" },
  { href: "/questions", key: "questions" },
  { href: "/exams", key: "history" },
  { href: "/stats", key: "stats" },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/exams") {
    return pathname === "/exams" || /^\/exams\/(?!new)[^/]+/.test(pathname);
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations().appShell;
  const { locale, setLocale } = useLanguage();
  const pathname = usePathname();

  return (
    <>
      <header className="border-b border-line bg-surface/70 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link
            href="/exams/new"
            className="flex items-center gap-2 font-display text-xl font-semibold"
          >
            <span
              aria-hidden
              className="grid size-7 place-items-center rounded-md bg-accent font-mono text-sm text-accent-ink"
            >
              ✓
            </span>
            {t.brand}
          </Link>

          <div className="ms-auto flex items-center gap-3">
            <Select
              aria-label={t.language}
              options={LOCALES.map((key) => ({
                key,
                label: LOCALE_LABEL[key],
              }))}
              value={locale}
              onChange={(value) => setLocale(value as Locale)}
              className="w-32 text-sm"
            />
            <AuthControl />
          </div>

          <Show when="signed-in">
            <nav className="-mx-1 flex w-full gap-1 overflow-x-auto text-sm">
              {LINKS.map((link) => {
                const active = isActive(pathname, link.href);
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
      <main className="mx-auto max-w-3xl px-4 py-8 print:max-w-none print:p-0">
        {children}
      </main>
    </>
  );
}
