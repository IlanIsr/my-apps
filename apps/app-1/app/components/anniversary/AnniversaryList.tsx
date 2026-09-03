"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { useI18n } from "@/i18n/context";
import { LOCALE_TAG } from "@/i18n/config";
import type { Anniversary } from "@/lib/anniversary";

export function AnniversaryList({
  anniversaries,
}: {
  anniversaries: Anniversary[];
}) {
  const { t, locale } = useI18n();
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
          <h1 className="text-2xl font-bold">{t.anniversary.listPage.title}</h1>
          <p className="text-sm opacity-70">{t.anniversary.listPage.subtitle}</p>
        </div>
        <Link
          href="/anniversaries/new"
          className="shrink-0 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-80"
        >
          {t.anniversary.add}
        </Link>
      </div>

      {anniversaries.length > 0 && (
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t.anniversary.search}
          className="rounded-lg border border-foreground/20 bg-background px-3 py-2 text-sm outline-none focus:border-foreground/50"
        />
      )}

      {filtered.length === 0 ? (
        <p className="text-sm opacity-70">
          {anniversaries.length === 0
            ? t.anniversary.empty.hint
            : t.anniversary.empty.noResults}
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
                  <span className="font-medium">{anniversary.name}</span>
                  <span className="text-sm opacity-60" dir="ltr">
                    {anniversary.hebDateLabel}
                  </span>
                </div>
                <div className="mt-1 text-sm opacity-70">
                  {anniversary.events[0] && (
                    <span>
                      {t.anniversary.card.nextEvent}:{" "}
                      {fmt(anniversary.events[0].date)} ·{" "}
                    </span>
                  )}
                  {t.anniversary.card.events(anniversary.events.length)}
                  {anniversary.shared.length > 0 && (
                    <span> · {t.anniversary.card.persons(anniversary.shared.length)}</span>
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
