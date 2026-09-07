"use client";

/**
 * Slim site footer: a privacy-policy link and the contact address, on every
 * page. Keeps the privacy policy discoverable from inside the app (not just the
 * public landing page) for Google OAuth verification. Reuses the `landing`
 * dictionary's `privacyLink` label — no new i18n keys.
 */

import Link from "next/link";

import { useTranslations } from "@/i18n";

const CONTACT_EMAIL = "ilanbellaichepro@gmail.com";

export function Footer() {
  const t = useTranslations();
  return (
    <footer className="mx-auto max-w-2xl px-6 pb-10">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-hairline pt-4 text-xs text-subtle-foreground">
        <Link href="/privacy" className="hover:text-foreground">
          {t.landing.privacyLink}
        </Link>
        <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-foreground">
          {CONTACT_EMAIL}
        </a>
      </div>
    </footer>
  );
}
