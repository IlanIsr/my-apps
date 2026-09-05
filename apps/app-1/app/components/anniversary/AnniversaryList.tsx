"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { LOCALE_TAG, useLanguage } from "@/i18n";
import { occurrencesSince, type Anniversary } from "@repo/anniversaries/person";

import { Eyebrow } from "../Eyebrow";
import { Ornament } from "../Ornament";

export type AnniversariesTexts = {
  listPage: {
    title: string;
    subtitle: (count: number, admin: boolean) => string;
  };
  add: string;
  search: string;
  joined: string;
  eyebrow: { birthday: string; yahrzeit: string };
  empty: {
    title: string;
    body: string;
    cta: string;
    noResults: string;
  };
  card: {
    nextEvent: string;
    events: (n: number) => string;
    members: (n: number) => string;
    age: (n: number) => string;
    since: (n: number) => string;
  };
};

export function AnniversaryList({
  anniversaries,
  t,
}: {
  anniversaries: Anniversary[];
  t: AnniversariesTexts;
}) {
  const { locale } = useLanguage();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? anniversaries.filter((a) => a.name.toLowerCase().includes(q))
      : anniversaries;
  }, [anniversaries, query]);

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(LOCALE_TAG[locale], {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const admin = anniversaries.some((a) => a.admin);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            {t.listPage.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t.listPage.subtitle(anniversaries.length, admin)}
          </p>
        </div>
        <Link
          href="/anniversaries/new"
          className="shrink-0 rounded-field bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
        >
          {t.add}
        </Link>
      </div>

      {anniversaries.length > 0 && (
        <div className="flex items-center gap-2.5 rounded-field border border-border bg-card px-3 py-2.5">
          <SearchIcon />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.search}
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-subtle-foreground"
          />
        </div>
      )}

      {anniversaries.length === 0 ? (
        <EmptyState t={t.empty} />
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.empty.noResults}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((anniversary) => (
            <li key={anniversary.id}>
              <AnniversaryCard anniversary={anniversary} t={t} fmt={fmt} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AnniversaryCard({
  anniversary,
  t,
  fmt,
}: {
  anniversary: Anniversary;
  t: AnniversariesTexts;
  fmt: (iso: string) => string;
}) {
  const yahrzeit = anniversary.type === "yahrzeit";
  const next = anniversary.events[0];
  const sinceCount = next
    ? occurrencesSince(anniversary.hebYear, next.year)
    : null;

  return (
    <Link
      href={`/anniversaries/${anniversary.id}`}
      className={`block rounded-card border p-4 transition-colors ${
        yahrzeit
          ? "border-border bg-sunken shadow-inner hover:border-border-strong"
          : "border-birthday-soft-border bg-card shadow-sm hover:border-birthday"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Eyebrow tone={yahrzeit ? "yahrzeit" : "birthday"} marker>
            {yahrzeit ? t.eyebrow.yahrzeit : t.eyebrow.birthday}
          </Eyebrow>
          <div
            className={`mt-1.5 font-display text-xl ${
              yahrzeit
                ? "font-normal text-yahrzeit-foreground"
                : "font-semibold text-card-foreground"
            }`}
          >
            {anniversary.name}
          </div>
          <div
            className={`font-display text-[15px] ${
              yahrzeit ? "text-yahrzeit" : "text-birthday"
            }`}
            dir="ltr"
          >
            {anniversary.hebDateLabel}
          </div>
        </div>
        {anniversary.joined && (
          <span
            className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ${
              yahrzeit
                ? "border-yahrzeit/30 bg-yahrzeit-soft text-yahrzeit"
                : "border-birthday-soft-border bg-birthday-soft text-birthday-soft-foreground"
            }`}
          >
            {t.joined}
          </span>
        )}
      </div>

      {next && (
        <>
          <div
            className={`my-3 h-px ${yahrzeit ? "bg-border" : "bg-hairline"}`}
          />
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12.5px] text-muted-foreground">
            <span>
              {t.card.nextEvent} ·{" "}
              <span className="font-semibold text-foreground">
                {fmt(next.date)}
              </span>
            </span>
            <Sep />
            <span>{t.card.events(anniversary.events.length)}</span>
            {anniversary.admin && anniversary.members.length > 0 && (
              <>
                <Sep />
                <span>{t.card.members(anniversary.members.length)}</span>
              </>
            )}
            {sinceCount !== null && (
              <>
                <Sep />
                <span>
                  {yahrzeit
                    ? t.card.since(sinceCount)
                    : t.card.age(sinceCount)}
                </span>
              </>
            )}
          </div>
        </>
      )}
    </Link>
  );
}

function EmptyState({ t }: { t: AnniversariesTexts["empty"] }) {
  return (
    <div className="flex flex-col items-center gap-2.5 rounded-card border border-dashed border-border-strong bg-card/50 px-6 py-9 text-center">
      <Ornament className="mb-1" />
      <div className="font-display text-lg font-semibold">{t.title}</div>
      <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
        {t.body}
      </p>
      <Link
        href="/anniversaries/new"
        className="mt-2 rounded-field border border-border-strong bg-card px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
      >
        {t.cta}
      </Link>
    </div>
  );
}

function Sep() {
  return <span className="text-border-strong">|</span>;
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5 shrink-0 text-subtle-foreground"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 4.5 4.5" />
    </svg>
  );
}
