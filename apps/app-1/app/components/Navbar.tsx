"use client";

import Link from "next/link";

import { useI18n } from "@/i18n/context";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeSwitcher } from "./ThemeSwitcher";

export function Navbar() {
  const { t } = useI18n();

  return (
    <header className="border-b border-foreground/10">
      <nav className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="font-bold">
          {t.appName}
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </nav>
    </header>
  );
}
