"use client";

/**
 * `/lexicon` — the masekhtot, with how many terms each lexicon holds — and
 * `/lexicon/[book]` — one masekhet's lexicon: the user's own translations,
 * grouped by amud, filtered to one amud (`?amud=`) or searched. Route
 * boundaries: read their texts.
 */

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { SimpleModal } from "@repo/ui/modal";

import {
  createLexiconEntryAction,
  deleteLexiconEntryAction,
  updateLexiconEntryAction,
} from "@/app/actions";
import { useLanguage, useTranslations } from "@/i18n";
import {
  amudim,
  amudLabel,
  masekhetName,
  masekhetOf,
  matchesLexicon,
  perekIndexOf,
  type LexiconEntry,
  type LexiconInput,
} from "@/lib/study-logic";
import { SHASS } from "@/lib/shass";

import { Button } from "./Button";
import { EmptyState, ErrorLine, fill, PageHeader } from "./common";
import { Select } from "./Select";
import { TextArea } from "./TextArea";
import { TextInput } from "./TextInput";

export type LexiconTexts = {
  eyebrow: string;
  title: string;
  terms: string;
  allAmudim: string;
  amud: string;
  search: string;
  add: string;
  addHere: string;
  edit: string;
  delete: string;
  emptyAmud: string;
  noMatch: string;
  empty: { title: string; description: string };
  form: {
    newTitle: string;
    editTitle: string;
    term: string;
    termPlaceholder: string;
    translation: string;
    note: string;
    save: string;
    saveAndNext: string;
    cancel: string;
  };
  deleteConfirm: {
    title: string;
    cancel: string;
    confirm: string;
  };
};

export function LexiconIndexView({
  counts,
}: {
  counts: Record<string, number>;
}) {
  const t = useTranslations().lexicon;
  const { locale } = useLanguage();
  const hebrew = locale === "he";

  return (
    <>
      <PageHeader eyebrow={t.eyebrow} title={t.title} />
      <ul className="grid gap-2 sm:grid-cols-2">
        {SHASS.map((m) => (
          <li key={m.key}>
            <Link
              href={`/lexicon/${encodeURIComponent(m.key)}`}
              className="sheet flex items-baseline justify-between gap-3 px-4 py-2.5 hover:border-line-strong"
            >
              <span className="font-medium">
                {hebrew ? m.he : `${m.key} · ${m.he}`}
              </span>
              {counts[m.key] ? (
                <span className="font-mono text-xs text-accent">
                  {fill(t.terms, { count: counts[m.key]! })}
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

type Draft = { id: string | null } & LexiconInput;

export function LexiconView({
  book,
  entries: initial,
  amud: initialAmud,
}: {
  book: string;
  entries: LexiconEntry[];
  /** The amud to show, or `null` for all of them. */
  amud: number | null;
}) {
  const messages = useTranslations();
  const t = messages.lexicon;
  const { locale } = useLanguage();
  const hebrew = locale === "he";
  const router = useRouter();
  const pathname = usePathname();
  const m = masekhetOf(book)!;

  const [entries, setEntries] = useState(initial);
  const [amud, setAmud] = useState<number | null>(initialAmud);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  // Bumped on "save and add another": remounts the fields, so focus goes
  // back to the term.
  const [formKey, setFormKey] = useState(0);
  const [toDelete, setToDelete] = useState<LexiconEntry | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const counts = useMemo(() => {
    const byAmud = new Map<number, number>();
    for (const e of entries) byAmud.set(e.amud, (byAmud.get(e.amud) ?? 0) + 1);
    return byAmud;
  }, [entries]);

  const groups = useMemo(() => {
    const shown = entries
      .filter(
        (e) => (amud === null || e.amud === amud) && matchesLexicon(e, query),
      )
      .sort((a, b) => a.amud - b.amud);
    const byAmud = new Map<number, LexiconEntry[]>();
    for (const e of shown)
      byAmud.set(e.amud, [...(byAmud.get(e.amud) ?? []), e]);
    return [...byAmud];
  }, [entries, amud, query]);

  function pickAmud(value: number | null) {
    setAmud(value);
    // Keep it in the URL so the page can be bookmarked / come back to.
    router.replace(value === null ? pathname : `${pathname}?amud=${value}`, {
      scroll: false,
    });
  }

  const blank = (at: number): Draft => ({
    id: null,
    book: m.key,
    amud: at,
    term: "",
    translation: "",
    note: "",
  });

  async function save(next: boolean) {
    if (!draft) return;
    setBusy(true);
    setError(null);
    const { id, ...input } = draft;
    const result = id
      ? await updateLexiconEntryAction(id, input)
      : await createLexiconEntryAction(input);
    setBusy(false);
    if (!result.ok) {
      setError(messages.errors[result.error]);
      return;
    }
    setEntries((list) =>
      id
        ? list.map((e) => (e.id === id ? result.data : e))
        : [...list, result.data],
    );
    setDraft(next ? blank(draft.amud) : null);
    setFormKey((k) => k + 1);
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setBusy(true);
    const result = await deleteLexiconEntryAction(toDelete.id);
    setBusy(false);
    if (!result.ok) {
      setError(messages.errors[result.error]);
      return;
    }
    setEntries((list) => list.filter((e) => e.id !== toDelete.id));
    setToDelete(null);
  }

  const amudOption = (a: number) => {
    const count = counts.get(a);
    return {
      key: String(a),
      label: count
        ? `${amudLabel(a, hebrew)} (${count})`
        : amudLabel(a, hebrew),
    };
  };

  return (
    <>
      <PageHeader eyebrow={t.eyebrow} title={masekhetName(m.key, hebrew)}>
        <Button
          variant="primary"
          onClick={() => setDraft(blank(amud ?? groups.at(-1)?.[0] ?? m.first))}
        >
          {t.add}
        </Button>
      </PageHeader>

      <div className="mb-6 grid gap-3 sm:grid-cols-[14rem_1fr]">
        <Select
          aria-label={t.amud}
          options={[
            { key: "all", label: fill(t.allAmudim, { count: entries.length }) },
            ...amudim(m.first, m.last).map(amudOption),
          ]}
          value={amud === null ? "all" : String(amud)}
          onChange={(key) => pickAmud(key === "all" ? null : Number(key))}
          className="w-full"
        />
        <TextInput
          type="search"
          dir="auto"
          value={query}
          placeholder={t.search}
          aria-label={t.search}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <ErrorLine message={error} />

      {entries.length === 0 && amud === null ? (
        <EmptyState title={t.empty.title} description={t.empty.description} />
      ) : groups.length === 0 ? (
        <div className="sheet flex flex-wrap items-center gap-3 px-4 py-4">
          <p className="flex-1 text-muted">
            {query
              ? t.noMatch
              : fill(t.emptyAmud, { amud: amudLabel(amud!, hebrew) })}
          </p>
          {!query && amud !== null && (
            <Button size="sm" onClick={() => setDraft(blank(amud))}>
              {t.addHere}
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {groups.map(([a, list]) => (
            <section key={a} className="space-y-2">
              <div className="flex items-baseline gap-3">
                <h2 className="text-lg">{amudLabel(a, hebrew)}</h2>
                <span className="text-xs text-muted">
                  {m.perakim[perekIndexOf(m, a)]?.he}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDraft(blank(a))}
                >
                  + {t.addHere}
                </Button>
              </div>
              <ul className="sheet divide-y divide-line">
                {list.map((e) => (
                  <li key={e.id} className="flex items-start gap-3 px-4 py-2.5">
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex flex-wrap items-baseline gap-x-3">
                        <span
                          className="font-display text-lg font-semibold"
                          dir="auto"
                        >
                          {e.term}
                        </span>
                        <span dir="auto">{e.translation}</span>
                      </div>
                      {e.note && (
                        <p
                          className="text-sm whitespace-pre-line text-muted"
                          dir="auto"
                        >
                          {e.note}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={t.edit}
                      onClick={() => setDraft({ ...e })}
                    >
                      ✎
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={t.delete}
                      onClick={() => setToDelete(e)}
                    >
                      ✕
                    </Button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {draft && (
        <SimpleModal
          isOpen
          onClose={() => setDraft(null)}
          isDismissable={!busy}
          title={draft.id ? t.form.editTitle : t.form.newTitle}
          footer={
            <>
              <Button variant="ghost" onClick={() => setDraft(null)}>
                {t.form.cancel}
              </Button>
              {!draft.id && (
                <Button
                  disabled={
                    busy || !draft.term.trim() || !draft.translation.trim()
                  }
                  onClick={() => save(true)}
                >
                  {t.form.saveAndNext}
                </Button>
              )}
              <Button
                variant="primary"
                disabled={
                  busy || !draft.term.trim() || !draft.translation.trim()
                }
                onClick={() => save(false)}
              >
                {t.form.save}
              </Button>
            </>
          }
        >
          <div key={formKey} className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">{t.amud}</span>
              <Select
                aria-label={t.amud}
                options={amudim(m.first, m.last).map(amudOption)}
                value={String(draft.amud)}
                onChange={(key) => setDraft({ ...draft, amud: Number(key) })}
                className="w-full"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">{t.form.term}</span>
              <TextInput
                autoFocus
                dir="auto"
                value={draft.term}
                placeholder={t.form.termPlaceholder}
                onChange={(e) => setDraft({ ...draft, term: e.target.value })}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">{t.form.translation}</span>
              <TextInput
                dir="auto"
                value={draft.translation}
                onChange={(e) =>
                  setDraft({ ...draft, translation: e.target.value })
                }
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">{t.form.note}</span>
              <TextArea
                dir="auto"
                rows={2}
                value={draft.note}
                onChange={(e) => setDraft({ ...draft, note: e.target.value })}
              />
            </label>
          </div>
        </SimpleModal>
      )}

      <SimpleModal
        isOpen={toDelete !== null}
        onClose={() => setToDelete(null)}
        isDismissable={!busy}
        title={t.deleteConfirm.title}
        description={
          toDelete ? `${toDelete.term} — ${toDelete.translation}` : ""
        }
        footer={
          <>
            <Button variant="ghost" onClick={() => setToDelete(null)}>
              {t.deleteConfirm.cancel}
            </Button>
            <Button variant="danger" disabled={busy} onClick={confirmDelete}>
              {t.deleteConfirm.confirm}
            </Button>
          </>
        }
      />
    </>
  );
}
