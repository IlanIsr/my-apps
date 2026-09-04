"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AuthControl } from "@repo/auth/nav";

import { useTranslations } from "@/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeSwitcher } from "./ThemeSwitcher";

export type NavbarTexts = {
  appName: string;
  tabs: {
    anniversaries: string;
    agenda: string;
    converter: string;
  };
  languageLabel: string;
  themeToggle: string;
};

export function Navbar() {
  const t = useTranslations().navbar;
  const pathname = usePathname();

  const tabs = [
    { href: "/anniversaries", label: t.tabs.anniversaries },
    { href: "/calendar", label: t.tabs.agenda },
    { href: "/converter", label: t.tabs.converter },
  ];

  return (
    <header className="border-b border-border bg-card">
      <nav className="mx-auto flex max-w-2xl flex-wrap items-center gap-x-4 gap-y-2 px-6 py-3 text-sm">
        <Link
          href="/anniversaries"
          className="min-w-0 truncate font-display text-base font-semibold whitespace-nowrap"
        >
          {t.appName}
        </Link>
        <div className="flex min-w-0 gap-0.5">
          {tabs.map((tab) => {
            const active = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`rounded-pill px-2.5 py-1.5 font-medium whitespace-nowrap transition-colors ${
                  active
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
        <div className="ms-auto flex shrink-0 items-center gap-2">
          <LanguageSwitcher label={t.languageLabel} />
          <ThemeSwitcher label={t.themeToggle} />
          <AuthControl />
        </div>
      </nav>
    </header>
  );
}
