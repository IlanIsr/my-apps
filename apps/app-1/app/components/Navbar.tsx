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
    <header className="border-b border-foreground/10">
      <nav className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-4 gap-y-2 px-6 py-4 text-sm">
        <Link href="/anniversaries" className="font-bold whitespace-nowrap">
          {t.appName}
        </Link>
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`whitespace-nowrap ${
              pathname.startsWith(tab.href)
                ? "font-medium"
                : "opacity-60 hover:opacity-100"
            }`}
          >
            {tab.label}
          </Link>
        ))}
        <div className="flex shrink-0 items-center gap-2 ms-auto">
          <LanguageSwitcher label={t.languageLabel} />
          <ThemeSwitcher label={t.themeToggle} />
          <AuthControl />
        </div>
      </nav>
    </header>
  );
}
