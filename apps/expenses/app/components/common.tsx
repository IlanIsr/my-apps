/**
 * Small layout pieces shared by the views: page header, empty state, error
 * line, link-as-button, and the `{placeholder}` filler.
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
      <div className="min-w-0">
        {eyebrow && <div className="eyebrow mb-1">{eyebrow}</div>}
        <h1 className="text-3xl break-words">{title}</h1>
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
    <div className="card flex flex-col items-start gap-3 px-6 py-10">
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

/** A labelled field (label above, control below). */
export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex min-w-0 flex-col gap-1 ${className ?? ""}`}>
      <span className="text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
