"use client";

import Link from "next/link";

import { LOCALE_TAG, useLanguage } from "@/i18n";

export type AgendaTexts = {
  title: string;
  subtitle: string;
  empty: string;
};

export type AgendaItem = {
  anniversaryId: string;
  name: string;
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

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(LOCALE_TAG[locale], {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <p className="text-sm opacity-70">{t.subtitle}</p>
      </div>

      {items.length === 0 ? (
        <p className="text-sm opacity-70">{t.empty}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-foreground/10 rounded-lg border border-foreground/15">
          {items.map((item) => (
            <li
              key={`${item.anniversaryId}-${item.date}`}
              className="flex items-center justify-between gap-3 p-3 text-sm"
            >
              <span>
                <Link
                  href={`/anniversaries/${item.anniversaryId}`}
                  className="font-medium hover:underline"
                >
                  {item.name}
                </Link>
                {item.time && (
                  <span className="opacity-60"> · {item.time}</span>
                )}
              </span>
              <span className="flex items-center gap-3">
                <span className="opacity-70">{fmt(item.date)}</span>
                {item.htmlLink && (
                  <a
                    href={item.htmlLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-60 hover:opacity-100"
                  >
                    ↗
                  </a>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
