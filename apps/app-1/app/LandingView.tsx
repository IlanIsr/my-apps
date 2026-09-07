"use client";

/**
 * Public landing page shown at `/` to signed-out visitors. Marketing copy only
 * — no authenticated data. Uses the app's own layout, fonts, palette, and
 * primitives (no separate design system) and the same component-owned i18n.
 */

import Link from "next/link";

import { useTranslations } from "@/i18n";
import { Eyebrow } from "./components/Eyebrow";
import { Ornament } from "./components/Ornament";

export type LandingTexts = {
  eyebrow: string;
  title: string;
  tagline: string;
  whatItDoes: { heading: string; body: string };
  whyCalendar: { heading: string; body: string };
  whoFor: { heading: string; body: string };
  howToUse: { heading: string; body: string };
  signIn: string;
  privacyLink: string;
};

export function LandingView() {
  const t = useTranslations().landing;

  const sections = [t.whatItDoes, t.whyCalendar, t.whoFor, t.howToUse];

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <Eyebrow>{t.eyebrow}</Eyebrow>
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {t.title}
        </h1>
        <p className="max-w-prose text-base leading-relaxed text-muted-foreground">
          {t.tagline}
        </p>
        <Ornament full className="mt-1" />
      </header>

      <div className="flex flex-col gap-6">
        {sections.map((section) => (
          <section key={section.heading} className="flex flex-col gap-1.5">
            <h2 className="font-display text-lg font-semibold">
              {section.heading}
            </h2>
            <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
              {section.body}
            </p>
          </section>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Link
          href="/sign-in"
          className="rounded-field bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
        >
          {t.signIn}
        </Link>
        <Link
          href="/privacy"
          className="text-sm text-subtle-foreground underline underline-offset-4 hover:text-foreground"
        >
          {t.privacyLink}
        </Link>
      </div>
    </div>
  );
}
