"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AuthControl } from "@repo/auth/nav";

import { useI18n } from "@/i18n/context";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeSwitcher } from "./ThemeSwitcher";

export function Navbar() {
  const { t } = useI18n();
  const pathname = usePathname();

  const tabs = [
    { href: "/anniversaries", label: t.anniversary.nav },
    { href: "/calendar", label: t.calendar.nav },
    { href: "/converter", label: t.home.nav },
  ];

  return (
    <header className="border-b border-foreground/10">
      <nav className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
          <Link href="/anniversaries" className="font-bold">
            {t.appName}
          </Link>
          {tabs.map((tab) => {
            const active = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={
                  active ? "font-medium" : "opacity-60 hover:opacity-100"
                }
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeSwitcher />
          <AuthControl />
        </div>
      </nav>
    </header>
  );
}
