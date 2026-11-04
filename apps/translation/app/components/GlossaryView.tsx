"use client";

/**
 * `/glossary` — the firm's glossary: Hebrew term → imposed rendering, per
 * target language. Every translation uses the entries its page contains, and
 * a page whose translation misses one gets a "glossary" flag. Entries are
 * added here, imported in bulk (`hébreu = traduction`, one per line), or from
 * a flag on the workbench. Route boundary: reads its texts.
 */

import { useMemo, useState } from "react";

import {
  deleteGlossaryEntriesAction,
  updateGlossaryEntryAction,
  upsertGlossaryAction,
} from "@/app/actions";
import { useTranslations } from "@/i18n";
import { TARGET_LANGS, type GlossaryEntry, type TargetLang } from "@/lib/model";

import { Button } from "./Button";
import { EmptyState, ErrorLine, fill, PageHeader } from "./common";
import { Field } from "./DocSettingsFields";
import { Segmented } from "./Segmented";
import { TextArea } from "./TextArea";
import { TextInput } from "./TextInput";

export type GlossaryTexts = {
  eyebrow: string;
  title: string;
  intro: string;
  hebrew: string;
  rendering: string;
  add: string;
  search: string;
  emptyTitle: string;
  emptyText: string;
  noMatch: string;
  edit: string;
  save: string;
  cancel: string;
  remove: string;
  importTitle: string;
  importHint: string;
  importButton: string;
  imported: string;
  importNothing: string;
  exportText: string;
  copied: string;
  count: string;
};

/** `hébreu = traduction` lines → entries (also accepts a tab or `;`). */
export function parseGlossaryText(text: string, lang: TargetLang) {
  return text
    .split(/\r?\n/)
    .map((line) => line.split(/\s*(?:=|\t|;)\s*/))
    .filter((parts) => parts.length >= 2)
    .map(([source, ...rest]) => ({
      lang,
      source: (source ?? "").trim(),
      rendering: rest.join(" = ").trim(),
    }))
    .filter((e) => e.source && e.rendering);
}

export function GlossaryView({ initial }: { initial: GlossaryEntry[] }) {
  const messages = useTranslations();
  const t = messages.glossary;
  const labels = messages.labels;
  const [entries, setEntries] = useState(initial);
  const [lang, setLang] = useState<TargetLang>("fr");
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("");
  const [rendering, setRendering] = useState("");
  const [bulk, setBulk] = useState("");
  const [editing, setEditing] = useState<GlossaryEntry | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const list = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    return entries.filter(
      (e) =>
        e.lang === lang &&
        (!q ||
          e.source.toLocaleLowerCase().includes(q) ||
          e.rendering.toLocaleLowerCase().includes(q)),
    );
  }, [entries, lang, query]);
  const total = entries.filter((e) => e.lang === lang).length;

  async function mutate(
    action: () => ReturnType<typeof upsertGlossaryAction>,
    onOk?: () => void,
  ) {
    setBusy(true);
    setError(null);
    const result = await action();
    setBusy(false);
    if (!result.ok) {
      setError(messages.errors[result.error]);
      return false;
    }
    setEntries(result.data);
    onOk?.();
    return true;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader eyebrow={t.eyebrow} title={t.title} />
      <p className="max-w-[75ch] text-muted">{t.intro}</p>

      <Segmented
        aria-label={messages.docSettings.target}
        options={TARGET_LANGS.map((k) => ({
          value: k,
          label: labels.target[k],
        }))}
        value={lang}
        onChange={setLang}
      />

      <form
        className="sheet grid gap-3 p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          if (!source.trim() || !rendering.trim()) return;
          void mutate(
            () => upsertGlossaryAction([{ lang, source, rendering }]),
            () => {
              setSource("");
              setRendering("");
            },
          );
        }}
      >
        <Field label={t.hebrew}>
          <TextInput
            dir="rtl"
            lang="he"
            value={source}
            maxLength={300}
            onChange={(e) => setSource(e.target.value)}
            className="font-he text-[16px]"
          />
        </Field>
        <Field label={`${t.rendering} (${labels.target[lang]})`}>
          <TextInput
            value={rendering}
            maxLength={300}
            onChange={(e) => setRendering(e.target.value)}
          />
        </Field>
        <Button type="submit" variant="primary" disabled={busy}>
          {t.add}
        </Button>
      </form>
      <ErrorLine message={error} />

      {total === 0 ? (
        <EmptyState title={t.emptyTitle} description={t.emptyText} />
      ) : (
        <section className="sheet">
          <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3">
            <TextInput
              type="search"
              aria-label={t.search}
              placeholder={t.search}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="max-w-sm"
            />
            <span className="text-sm text-muted">
              {fill(t.count, { n: total })}
            </span>
          </div>
          {list.length === 0 ? (
            <p className="px-5 py-6 text-muted">{t.noMatch}</p>
          ) : (
            <ul className="divide-y divide-line">
              {list.map((entry) =>
                editing?.id === entry.id ? (
                  <li
                    key={entry.id}
                    className="grid gap-2 px-5 py-3 sm:grid-cols-[1fr_1fr_auto]"
                  >
                    <TextInput
                      dir="rtl"
                      lang="he"
                      aria-label={t.hebrew}
                      value={editing.source}
                      onChange={(e) =>
                        setEditing({ ...editing, source: e.target.value })
                      }
                      className="font-he text-[16px]"
                    />
                    <TextInput
                      aria-label={t.rendering}
                      value={editing.rendering}
                      onChange={(e) =>
                        setEditing({ ...editing, rendering: e.target.value })
                      }
                    />
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={busy}
                        onClick={() =>
                          void mutate(
                            () =>
                              updateGlossaryEntryAction(entry.id, {
                                lang: entry.lang,
                                source: editing.source,
                                rendering: editing.rendering,
                              }),
                            () => setEditing(null),
                          )
                        }
                      >
                        {t.save}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditing(null)}
                      >
                        {t.cancel}
                      </Button>
                    </div>
                  </li>
                ) : (
                  <li
                    key={entry.id}
                    className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-2.5"
                  >
                    <span
                      dir="rtl"
                      lang="he"
                      className="min-w-40 font-he text-[17px]"
                    >
                      {entry.source}
                    </span>
                    <span aria-hidden className="text-muted rtl:rotate-180">
                      →
                    </span>
                    <span className="min-w-0 flex-1 font-doc">
                      {entry.rendering}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditing(entry)}
                      >
                        {t.edit}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busy}
                        onClick={() =>
                          void mutate(() =>
                            deleteGlossaryEntriesAction([entry.id]),
                          )
                        }
                      >
                        {t.remove}
                      </Button>
                    </div>
                  </li>
                ),
              )}
            </ul>
          )}
        </section>
      )}

      <section className="sheet space-y-3 p-5">
        <h2 className="text-lg">{t.importTitle}</h2>
        <p className="text-sm text-muted">{t.importHint}</p>
        <TextArea
          dir="auto"
          rows={6}
          value={bulk}
          placeholder="ייפוי כוח מתמשך = mandat de protection future"
          onChange={(e) => setBulk(e.target.value)}
          className="font-doc"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="primary"
            disabled={busy || !bulk.trim()}
            onClick={() => {
              const parsed = parseGlossaryText(bulk, lang);
              if (!parsed.length) {
                setNotice(t.importNothing);
                return;
              }
              void mutate(
                () => upsertGlossaryAction(parsed),
                () => {
                  setBulk("");
                  setNotice(fill(t.imported, { n: parsed.length }));
                },
              );
            }}
          >
            {t.importButton}
          </Button>
          <Button
            variant="outline"
            disabled={!total}
            onClick={async () => {
              const text = entries
                .filter((e) => e.lang === lang)
                .map((e) => `${e.source} = ${e.rendering}`)
                .join("\n");
              try {
                await navigator.clipboard.writeText(text);
                setNotice(t.copied);
              } catch {
                setBulk(text);
              }
            }}
          >
            {t.exportText}
          </Button>
          {notice && <span className="text-sm text-muted">{notice}</span>}
        </div>
      </section>
    </div>
  );
}
