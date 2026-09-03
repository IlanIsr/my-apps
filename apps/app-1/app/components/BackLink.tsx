"use client";

import Link from "next/link";

import { useLanguage } from "@/i18n";

/** A back link whose arrow follows the writing direction (← ltr, → rtl). */
export function BackLink({ href, label }: { href: string; label?: string }) {
  const { dir } = useLanguage();
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm opacity-70 hover:opacity-100"
    >
      <span aria-hidden>{dir === "rtl" ? "→" : "←"}</span>
      {label ? <span>{label}</span> : null}
    </Link>
  );
}
