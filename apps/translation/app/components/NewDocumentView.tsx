"use client";

/**
 * `/documents/new` — drop the files, check the pages (order, rotation,
 * removal), set the document's settings, create it. The scans are saved in
 * this browser only; the workbench then starts reading and translating.
 * Route boundary: reads its texts.
 */

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { createDocumentAction } from "@/app/actions";
import { useTranslations } from "@/i18n";
import {
  ingestFiles,
  MAX_PAGES,
  releasePages,
  rotatePage,
  toPageInput,
  type PreparedPage,
} from "@/lib/ingest";
import type { Settings } from "@/lib/model";
import { putScan } from "@/lib/scan-store";

import { Button } from "./Button";
import { Checkbox } from "./Checkbox";
import { ErrorLine, fill, LinkButton, PageHeader } from "./common";
import {
  DocSettingsFields,
  Field,
  type DocSettingsValue,
} from "./DocSettingsFields";
import { FileDrop } from "./FileDrop";
import { TextInput } from "./TextInput";

export type NewDocumentTexts = {
  eyebrow: string;
  title: string;
  documentTitle: string;
  documentTitlePlaceholder: string;
  pagesHeading: string;
  noPages: string;
  ready: string;
  skipped: string;
  truncated: string;
  nothingReadable: string;
  moveUp: string;
  moveDown: string;
  rotate: string;
  remove: string;
  settings: string;
  startNow: string;
  startNowHint: string;
  create: string;
  creating: string;
  cancel: string;
  privacy: string;
};

const stripExtension = (name: string) => name.replace(/\.[^.]+$/, "");

export function NewDocumentView({ defaults }: { defaults: Settings }) {
  const messages = useTranslations();
  const t = messages.newDocument;
  const router = useRouter();

  const [pages, setPages] = useState<PreparedPage[]>([]);
  const [title, setTitle] = useState("");
  const [settings, setSettings] = useState<DocSettingsValue>({
    target: defaults.defaultTarget,
    doctype: defaults.defaultDoctype,
    quality: defaults.defaultQuality,
    highRes: defaults.defaultHighRes,
  });
  const [startNow, setStartNow] = useState(true);
  const [reading, setReading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Revoke the preview URLs when leaving.
  const pagesRef = useRef(pages);
  useEffect(() => {
    pagesRef.current = pages;
  }, [pages]);
  useEffect(() => () => releasePages(pagesRef.current), []);

  async function addFiles(files: File[]) {
    setReading(true);
    setError(null);
    try {
      const result = await ingestFiles(files, MAX_PAGES - pages.length);
      if (!result.pages.length) {
        setReport(t.nothingReadable);
        return;
      }
      setPages((list) => [...list, ...result.pages]);
      if (!title && files[0]) setTitle(stripExtension(files[0].name));
      const parts = [fill(t.ready, { n: pages.length + result.pages.length })];
      if (result.skipped.length) {
        parts.push(fill(t.skipped, { files: result.skipped.join(", ") }));
      }
      if (result.truncated) parts.push(fill(t.truncated, { max: MAX_PAGES }));
      setReport(parts.join(" "));
    } finally {
      setReading(false);
    }
  }

  function move(index: number, delta: -1 | 1) {
    setPages((list) => {
      const next = [...list];
      const j = index + delta;
      if (j < 0 || j >= next.length) return list;
      [next[index], next[j]] = [next[j]!, next[index]!];
      return next;
    });
  }

  async function rotate(index: number) {
    const page = pages[index];
    if (!page) return;
    const rotated = await rotatePage(page);
    setPages((list) => list.map((p, i) => (i === index ? rotated : p)));
  }

  function remove(index: number) {
    setPages((list) => {
      const page = list[index];
      if (page) releasePages([page]);
      return list.filter((_, i) => i !== index);
    });
  }

  async function create() {
    if (!pages.length) return;
    setCreating(true);
    setError(null);
    const result = await createDocumentAction({
      title: title.trim() || stripExtension(pages[0]!.source),
      ...settings,
      pages: pages.map(toPageInput),
    });
    if (!result.ok) {
      setCreating(false);
      setError(messages.errors[result.error]);
      return;
    }
    // Pages come back in the same order: store each scan under its id.
    await Promise.all(
      result.data.pages.map((p, i) => {
        const blob = pages[i]?.blob;
        return blob ? putScan(p.id, blob) : undefined;
      }),
    );
    router.push(
      `/documents/${result.data.document.id}${startNow ? "?run=1" : ""}`,
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader eyebrow={t.eyebrow} title={t.title} />

      <section className="sheet space-y-4 p-5">
        <FileDrop
          onFiles={(f) => void addFiles(f)}
          t={messages.fileDrop}
          busy={reading}
        />
        {report && <p className="text-sm text-muted">{report}</p>}

        {pages.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg">{t.pagesHeading}</h2>
            <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {pages.map((page, i) => (
                <li
                  key={page.key}
                  className="flex flex-col overflow-hidden rounded-md border border-line bg-surface"
                >
                  <div className="relative grid aspect-[3/4] place-items-center overflow-hidden bg-sunken">
                    {page.url ? (
                      // eslint-disable-next-line @next/next/no-img-element -- local object URL
                      <img
                        src={page.url}
                        alt=""
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <p
                        dir="rtl"
                        lang="he"
                        className="line-clamp-[10] p-3 font-he text-[11px] leading-snug"
                      >
                        {page.transcription?.blocks
                          .map((b) => b.text)
                          .join(" ")}
                      </p>
                    )}
                    <span className="absolute start-1.5 top-1.5 rounded bg-surface/90 px-1.5 font-mono text-xs">
                      {i + 1}
                    </span>
                  </div>
                  <div className="space-y-1 p-2">
                    <p
                      className="truncate text-xs text-muted"
                      title={page.source}
                    >
                      {page.source}
                    </p>
                    <p className="text-xs">
                      {messages.labels.origin[page.origin]}
                    </p>
                    <div className="flex flex-wrap gap-0.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        isIconOnly
                        aria-label={t.moveUp}
                        disabled={i === 0}
                        onClick={() => move(i, -1)}
                      >
                        <span aria-hidden className="rtl:rotate-180">
                          ←
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        isIconOnly
                        aria-label={t.moveDown}
                        disabled={i === pages.length - 1}
                        onClick={() => move(i, 1)}
                      >
                        <span aria-hidden className="rtl:rotate-180">
                          →
                        </span>
                      </Button>
                      {page.blob && (
                        <Button
                          variant="ghost"
                          size="sm"
                          isIconOnly
                          aria-label={t.rotate}
                          onClick={() => void rotate(i)}
                        >
                          <span aria-hidden>↻</span>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        isIconOnly
                        aria-label={t.remove}
                        onClick={() => remove(i)}
                      >
                        <span aria-hidden>✕</span>
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>

      <section className="sheet space-y-5 p-5">
        <h2 className="text-lg">{t.settings}</h2>
        <Field label={t.documentTitle}>
          <TextInput
            value={title}
            maxLength={200}
            placeholder={t.documentTitlePlaceholder}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>
        <DocSettingsFields
          value={settings}
          onChange={(patch) => setSettings((s) => ({ ...s, ...patch }))}
          t={messages.docSettings}
          labels={messages.labels}
        />
        <Checkbox checked={startNow} onChange={setStartNow}>
          <span className="text-sm">
            <span className="font-medium">{t.startNow}</span>
            <span className="block text-muted">{t.startNowHint}</span>
          </span>
        </Checkbox>
      </section>

      <ErrorLine message={error} />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="primary"
          disabled={!pages.length || creating || reading}
          onClick={() => void create()}
        >
          {creating ? t.creating : t.create}
        </Button>
        <LinkButton href="/" variant="ghost">
          {t.cancel}
        </LinkButton>
        {!pages.length && (
          <span className="text-sm text-muted">{t.noPages}</span>
        )}
      </div>
      <p className="max-w-[75ch] text-sm text-muted">{t.privacy}</p>
    </div>
  );
}
