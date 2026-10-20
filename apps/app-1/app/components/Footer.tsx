"use client";

/**
 * Slim site footer: a privacy-policy link, the contact form and the contact
 * address, on every page. Keeps the privacy policy discoverable from inside the app (not just the
 * public landing page) for Google OAuth verification.
 */

import Link from "next/link";

import { useTranslations } from "@/i18n";
import { CONTACT_EMAIL } from "@/lib/contact";

/**
 * Text this component needs. Like every app-1 component, it owns its slice of
 * the message tree; the shape is assembled into `Messages` in `i18n/messages.ts`
 * and each locale dictionary must `satisfies` it.
 */
export type FooterTexts = {
  privacyLink: string;
  contactLink: string;
};

/**
 * Rendered directly under the root layout (a server component) with no
 * client parent to source `t` from — like {@link Navbar}, it's a shell-level
 * boundary that calls {@link useTranslations} itself rather than taking `t`
 * as a prop.
 */
export function Footer() {
  const t = useTranslations().footer;
  return (
    <footer className="mx-auto max-w-2xl px-6 pb-10">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-hairline pt-4 text-xs text-subtle-foreground">
        <Link href="/privacy" className="hover:text-foreground">
          {t.privacyLink}
        </Link>
        <Link href="/contact" className="hover:text-foreground">
          {t.contactLink}
        </Link>
        <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-foreground">
          {CONTACT_EMAIL}
        </a>
      </div>
    </footer>
  );
}
