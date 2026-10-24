"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { AuthControl } from "@repo/auth/nav";

import { useTranslations } from "@/i18n";
import { Button } from "./Button";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeSwitcher } from "./ThemeSwitcher";

/**
 * Text this component needs. Like every app-1 component, it owns its slice of
 * the message tree; the shape is assembled into `Messages` in `i18n/messages.ts`
 * and each locale dictionary must `satisfies` it.
 */
export type NavbarTexts = {
  appName: string;
  tabs: {
    anniversaries: string;
    agenda: string;
    converter: string;
    about: string;
    admin: string;
  };
  languageLabel: string;
  themeToggle: string;
  signIn: string;
  /** Accessible label of the mobile burger button. */
  menu: string;
};

/**
 * The app shell header: wordmark, route tabs, language + theme switchers, and
 * the Clerk account control. Below `md` the tabs and switchers move into a
 * burger menu that drops down under the bar. It is the only component besides the client
 * `page.tsx`/route boundaries that calls {@link useTranslations} directly.
 *
 * @param isAdmin - Whether to show the `/admin` tab (server-computed from
 *   `ANNIVERSARIES_ADMIN_EMAILS` and passed down from the layout).
 */
export function Navbar({ isAdmin = false }: { isAdmin?: boolean }) {
  const t = useTranslations().navbar;
  const pathname = usePathname();

  const tabs = [
    { href: "/anniversaries", label: t.tabs.anniversaries },
    { href: "/calendar", label: t.tabs.agenda },
    { href: "/converter", label: t.tabs.converter },
    { href: "/about", label: t.tabs.about },
    ...(isAdmin ? [{ href: "/admin", label: t.tabs.admin }] : []),
  ];

  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const tabLinks = (vertical: boolean) =>
    tabs.map((tab) => {
      const active = pathname.startsWith(tab.href);
      return (
        <Link
          key={tab.href}
          href={tab.href}
          onClick={close}
          className={`rounded-pill font-medium whitespace-nowrap transition-colors ${
            vertical ? "px-3 py-2.5" : "px-2.5 py-1.5"
          } ${
            active
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {tab.label}
        </Link>
      );
    });

  const switchers = (
    <>
      <LanguageSwitcher label={t.languageLabel} />
      <ThemeSwitcher label={t.themeToggle} />
    </>
  );

  return (
    <header className="border-b border-border bg-card">
      <nav className="mx-auto flex max-w-5xl items-center gap-x-4 px-6 py-3 text-sm">
        <Link
          href="/anniversaries"
          onClick={close}
          className="min-w-0 truncate font-display text-base font-semibold whitespace-nowrap"
        >
          {t.appName}
        </Link>
        <div className="hidden min-w-0 gap-0.5 md:flex">{tabLinks(false)}</div>
        <div className="ms-auto flex shrink-0 items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">{switchers}</div>
          <AuthControl
            signedOut={
              <Link
                href="/sign-in"
                className="rounded-pill bg-primary px-3 py-1.5 font-semibold whitespace-nowrap text-primary-foreground transition-opacity hover:opacity-90"
              >
                {t.signIn}
              </Link>
            }
          />
          <Button
            variant="outline"
            size="sm"
            isIconOnly
            aria-label={t.menu}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="md:hidden"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? (
              <CloseIcon className="h-5 w-5" />
            ) : (
              <MenuIcon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </nav>
      {open && (
        <div
          id="mobile-menu"
          className="mx-auto flex max-w-5xl flex-col gap-3 border-t border-hairline px-6 py-3 text-sm md:hidden"
        >
          <div className="flex flex-col gap-0.5">{tabLinks(true)}</div>
          <div className="flex items-center gap-2">{switchers}</div>
        </div>
      )}
    </header>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
