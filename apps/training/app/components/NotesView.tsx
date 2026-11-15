"use client";

/**
 * `/notes` — every note, grouped by masekhet in Shass order, then by amud;
 * a search over titles and text. Route boundary: reads its texts.
 */

import Link from "next/link";
import { useMemo, useState } from "react";

import { useLanguage, useTranslations } from "@/i18n";
import { masekhetName, rangeLabel, type Note } from "@/lib/study-logic";
import { SHASS } from "@/lib/shass";

import { EmptyState, LinkButton, PageHeader } from "./common";
import { TextInput } from "./TextInput";

export type NotesTexts = {
  eyebrow: string;
  title: string;
  newNote: string;
  search: string;
  untitled: string;
  noMatch: string;
  empty: { title: string; description: string };
};

const order = new Map(SHASS.map((m, i) => [m.key, i]));

export function NotesView({ notes }: { notes: Note[] }) {
  const t = useTranslations().notes;
  const { locale } = useLanguage();
  const hebrew = locale === "he";
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const shown = notes
      .filter((n) => !q || `${n.title}\n${n.text}`.toLowerCase().includes(q))
      .sort(
        (a, b) =>
          (order.get(a.book) ?? 99) - (order.get(b.book) ?? 99) ||
          a.startAmud - b.startAmud,
      );
    const byBook = new Map<string, Note[]>();
    for (const n of shown)
      byBook.set(n.book, [...(byBook.get(n.book) ?? []), n]);
    return [...byBook];
  }, [notes, query]);

  return (
    <>
      <PageHeader eyebrow={t.eyebrow} title={t.title}>
        <LinkButton href="/notes/new" variant="primary">
          {t.newNote}
        </LinkButton>
      </PageHeader>

      {notes.length === 0 ? (
        <EmptyState title={t.empty.title} description={t.empty.description} />
      ) : (
        <div className="space-y-6">
          <TextInput
            type="search"
            dir="auto"
            value={query}
            placeholder={t.search}
            aria-label={t.search}
            onChange={(e) => setQuery(e.target.value)}
          />
          {groups.length === 0 && <p className="text-muted">{t.noMatch}</p>}
          {groups.map(([book, list]) => (
            <section key={book} className="space-y-2">
              <h2 className="text-lg">{masekhetName(book, hebrew)}</h2>
              <ul className="space-y-2">
                {list.map((note) => (
                  <li key={note.id}>
                    <Link
                      href={`/notes/${note.id}`}
                      className="sheet block space-y-1 px-4 py-3 hover:border-line-strong"
                    >
                      <div className="flex items-baseline gap-3">
                        <span className="font-mono text-xs text-muted">
                          {rangeLabel(note.startAmud, note.endAmud, hebrew)}
                        </span>
                        <span className="font-medium" dir="auto">
                          {note.title || t.untitled}
                        </span>
                      </div>
                      {note.text && (
                        <p
                          className="line-clamp-2 text-sm text-muted"
                          dir="auto"
                        >
                          {note.text}
                        </p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
