"use client";

import Link from "next/link";

import { LOCALE_TAG, useLanguage } from "@/i18n";
import {
  occurrencesSince,
  type AnniversaryType,
} from "@repo/anniversaries/person";

import { Eyebrow } from "../Eyebrow";

export type AgendaTexts = {
  title: string;
  subtitle: string;
  empty: string;
  nightfall: string;
  calendar: string;
  age: (n: number) => string;
  since: (n: number) => string;
};

export type AgendaItem = {
  anniversaryId: string;
  name: string;
  type: AnniversaryType;
  year: number;
  hebYear?: number;
  date: string;
  time?: string;
  htmlLink?: string;
};

export function CalendarAgenda({
  items,
  t,
}: {
  items: AgendaItem[];
  t: AgendaTexts;
}) {
  const { locale } = useLanguage();
  const tag = LOCALE_TAG[locale];

  const monthLabel = (iso: string) =>
    new Date(iso).toLocaleDateString(tag, { month: "long", year: "numeric" });
  const rowLabel = (iso: string) =>
    new Date(iso).toLocaleDateString(tag, {
      weekday: "short",
      day: "numeric",
      month: "short",
    });

  // Group consecutive items by calendar month (items arrive date-sorted).
  const groups: { label: string; items: AgendaItem[] }[] = [];
  for (const item of items) {
    const label = monthLabel(item.date);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(item);
    else groups.push({ label, items: [item] });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {t.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.subtitle}</p>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.empty}</p>
      ) : (
        <div className="flex flex-col gap-5">
          {groups.map((group) => (
            <div key={group.label} className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5">
                <Eyebrow>{group.label}</Eyebrow>
                <span className="h-px flex-1 bg-border" />
              </div>
              <ul className="flex flex-col divide-y divide-hairline overflow-hidden rounded-card border border-border bg-card">
                {group.items.map((item) => {
                  const yahrzeit = item.type === "yahrzeit";
                  const count = occurrencesSince(item.hebYear, item.year);
                  return (
                    <li
                      key={`${item.anniversaryId}-${item.date}`}
                      className="flex items-center gap-3 p-3.5 text-sm"
                    >
                      <span
                        aria-hidden
                        className={`h-[7px] w-[7px] shrink-0 ${
                          yahrzeit
                            ? "rotate-45 bg-yahrzeit"
                            : "rounded-full bg-birthday"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/anniversaries/${item.anniversaryId}`}
                          className="font-display font-semibold hover:underline"
                        >
                          {item.name}
                        </Link>
                        <div className="text-[12.5px] text-muted-foreground">
                          {rowLabel(item.date)}
                          {item.time ? ` · ${item.time} ${t.nightfall}` : ""}
                          {count !== null &&
                            ` · ${yahrzeit ? t.since(count) : t.age(count)}`}
                        </div>
                      </div>
                      {item.htmlLink && (
                        <a
                          href={item.htmlLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-[12.5px] font-semibold whitespace-nowrap ${
                            yahrzeit ? "text-yahrzeit" : "text-birthday"
                          } hover:underline`}
                        >
                          {t.calendar} ↗
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
