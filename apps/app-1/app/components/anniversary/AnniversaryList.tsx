"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { LOCALE_TAG, useLanguage } from "@/i18n";
import type { Anniversary } from "@repo/anniversaries";

export type AnniversariesTexts = {
  listPage: { title: string; subtitle: string };
  add: string;
  search: string;
  joined: string;
  empty: { hint: string; noResults: string };
  card: {
    nextEvent: string;
    events: (n: number) => string;
    members: (n: number) => string;
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
    new Date(iso).toLocaleDateString(LOCALE_TAG[locale]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t.listPage.title}</h1>
          <p className="text-sm opacity-70">{t.listPage.subtitle}</p>
        </div>
        <Link
          href="/anniversaries/new"
          className="shrink-0 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-80"
        >
          {t.add}
        </Link>
      </div>

      {anniversaries.length > 0 && (
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t.search}
          className="rounded-lg border border-foreground/20 bg-background px-3 py-2 text-sm outline-none focus:border-foreground/50"
        />
      )}

      {filtered.length === 0 ? (
        <p className="text-sm opacity-70">
          {anniversaries.length === 0 ? t.empty.hint : t.empty.noResults}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((anniversary) => (
            <li key={anniversary.id}>
              <Link
                href={`/anniversaries/${anniversary.id}`}
                className="block rounded-lg border border-foreground/15 p-4 transition-colors hover:border-foreground/40 hover:bg-foreground/5"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-medium">
                    {anniversary.name}
                    {anniversary.joined && (
                      <span className="ml-2 rounded bg-foreground/10 px-1.5 py-0.5 text-xs font-normal opacity-80">
                        {t.joined}
                      </span>
                    )}
                  </span>
                  <span className="text-sm opacity-60" dir="ltr">
                    {anniversary.hebDateLabel}
                  </span>
                </div>
                <div className="mt-1 text-sm opacity-70">
                  {anniversary.events[0] && (
                    <span>
                      {t.card.nextEvent}: {fmt(anniversary.events[0].date)} ·{" "}
                    </span>
                  )}
                  {t.card.events(anniversary.events.length)}
                  {anniversary.members.length > 0 && (
                    <span> · {t.card.members(anniversary.members.length)}</span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
