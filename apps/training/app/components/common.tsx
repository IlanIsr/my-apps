/**
 * Small layout pieces shared by the views: page header, empty state, error
 * line, and the date formatter.
 */

import Link from "next/link";

import type { ActionErrorCode } from "@/app/actions";

export type ErrorTexts = Record<ActionErrorCode, string>;

export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  /** Actions, at the end of the row. */
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && <div className="eyebrow mb-1">{eyebrow}</div>}
        <h1 className="text-3xl">{title}</h1>
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="sheet ruled flex flex-col items-start gap-3 px-6 py-10">
      <h2 className="text-xl">{title}</h2>
      {description && <p className="text-muted">{description}</p>}
      {children}
    </div>
  );
}

export function ErrorLine({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-sm font-medium text-danger">
      {message}
    </p>
  );
}

export function formatDate(iso: string, tag: string): string {
  return new Date(iso).toLocaleString(tag, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** `{name}` placeholders → values. */
export function fill(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

const LINK_TONE = {
  primary:
    "bg-accent text-accent-ink hover:opacity-90 border border-transparent",
  outline: "border border-line-strong bg-surface hover:bg-sunken",
  ghost: "text-accent hover:bg-accent-soft border border-transparent",
};

/** A navigation link that looks like a `Button`. */
export function LinkButton({
  href,
  variant = "outline",
  size = "md",
  children,
}: {
  href: string;
  variant?: keyof typeof LINK_TONE;
  size?: "sm" | "md";
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-1.5 rounded-[var(--radius)] font-medium transition ${
        size === "sm" ? "h-8 px-3 text-sm" : "h-10 px-4"
      } ${LINK_TONE[variant]}`}
    >
      {children}
    </Link>
  );
}
