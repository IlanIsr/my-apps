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
  const onAnniversaries = pathname.startsWith("/anniversaries");

  return (
    <header className="border-b border-foreground/10">
      <nav className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-baseline gap-4 text-sm">
          <Link href="/" className="font-bold">
            {t.appName}
          </Link>
          <Link
            href="/anniversaries"
            className={
              onAnniversaries ? "font-medium" : "opacity-60 hover:opacity-100"
            }
          >
            {t.anniversary.nav}
          </Link>
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
