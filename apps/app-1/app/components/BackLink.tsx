"use client";

import Link from "next/link";

import { useLanguage } from "@/i18n";

/** A back link whose chevron follows the writing direction (‹ ltr, › rtl). */
export function BackLink({ href, label }: { href: string; label?: string }) {
  const { dir } = useLanguage();
  return (
    <Link
      href={href}
      className="-ms-0.5 inline-flex items-center gap-1.5 text-sm text-subtle-foreground hover:text-foreground"
    >
      <svg
        viewBox="0 0 10 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className={`h-4 w-2.5 shrink-0 ${dir === "rtl" ? "rotate-180" : ""}`}
      >
        <path d="M8 2 2 8l6 6" />
      </svg>
      {label ? <span>{label}</span> : null}
    </Link>
  );
}
