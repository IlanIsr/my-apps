"use client";

/**
 * `/documents/[id]` — the workbench. Runs the pipeline from the browser
 * (each page: transcription, then translation — two pages at a time, through
 * the API routes), holds the pages in state, auto-saves the reviewer's edits,
 * and exports. Route boundary: reads its texts.
 *
 * The scans come from this browser's IndexedDB; a page whose scan isn't
 * here can still be translated and reviewed, just not read again.
 */

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { SimpleModal } from "@repo/ui/modal";

import {
  addPagesAction,
  deleteDocumentAction,
  deletePageAction,
  movePageAction,
  saveReviewAction,
  saveTranscriptionAction,
  updateDocumentAction,
  upsertGlossaryAction,
} from "@/app/actions";
import { useLanguage, useTranslations } from "@/i18n";
import * as api from "@/lib/api";
import { computeFlags, isOpen, pageStatus, type KeyedFlag } from "@/lib/checks";
import { FATAL_ERRORS, type ErrorCode } from "@/lib/errors";
import {
  exportTranscription,
  exportTranslation,
  TRANSLATION_TEXTS,
} from "@/lib/export-docx";
import {
  imagesForTranscription,
  ingestFiles,
  MAX_PAGES,
  toPageInput,
} from "@/lib/ingest";
import type {
  Block,
  DocumentInfo,
  FullDocument,
  GlossaryEntry,
  NoteLang,
  Page,
  Settings,
} from "@/lib/model";
import { deleteScans, getScan, putScan } from "@/lib/scan-store";

import { Button } from "./Button";
import { fill } from "./common";
import { DocSettingsFields } from "./DocSettingsFields";
import { FileDrop } from "./FileDrop";
import type { ReviewChange } from "./FlagList";
import { PageCard, type SaveState } from "./PageCard";
import { Segmented } from "./Segmented";
import { TextInput } from "./TextInput";

export type WorkbenchTexts = {
  back: string;
  settings: string;
  settingsTargetChanged: string;
  stats: {
    pages: string;
    read: string;
    translated: string;
    reviewed: string;
    open: string;
    bad: string;
    failed: string;
  };
  run: string;
  continue: string;
  allDone: string;
  running: string;
  stop: string;
  stopping: string;
  retranslateAll: string;
  retranslateConfirmTitle: string;
  retranslateConfirmText: string;
  confirm: string;
  cancel: string;
  exportTranslation: string;
  exportTranscription: string;
  copy: string;
  copied: string;
  copyFailed: string;
  copyHeading: string;
  addPages: string;
  addPagesTitle: string;
  addPagesHint: string;
  deleteDocument: string;
  deleteConfirmTitle: string;
  deleteConfirmText: string;
  filter: { all: string; open: string };
  noOpen: string;
  jumpTo: string;
  stopped: string;
  fatal: string;
  zoomTitle: string;
  footer: string;
};

type Running = Record<string, "reading" | "translating">;

/** Runs `fn` over `items`, `n` at a time, until `shouldStop()`. */
async function pool<T>(
  items: readonly T[],
  n: number,
  fn: (item: T) => Promise<void>,
  shouldStop: () => boolean,
) {
  let i = 0;
  const worker = async () => {
    while (i < items.length && !shouldStop()) await fn(items[i++] as T);
  };
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, worker));
}

export function WorkbenchView({
  initial,
  glossary: initialGlossary,
  settings,
}: {
  initial: FullDocument;
  glossary: GlossaryEntry[];
  settings: Settings;
}) {
  const messages = useTranslations();
  const t = messages.workbench;
  const { locale } = useLanguage();
  const noteLang: NoteLang = locale;
  const router = useRouter();
  const search = useSearchParams();

  const [doc, setDoc] = useState<DocumentInfo>(initial.document);
  const [pages, setPages] = useState<Page[]>(initial.pages);
  const [glossary, setGlossary] = useState(initialGlossary);
  const [scans, setScans] = useState<Record<string, string>>({});
  const [running, setRunning] = useState<Running>({});
  const [active, setActive] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [fatal, setFatal] = useState<ErrorCode | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saveStates, setSaveStates] = useState<Record<string, SaveState>>({});
  const [filter, setFilter] = useState<"all" | "open">("all");
  const [zoom, setZoom] = useState<string | null>(null);
  const [modal, setModal] = useState<"retranslate" | "delete" | "add" | null>(
    null,
  );
  const [adding, setAdding] = useState(false);
  const [titleDraft, setTitleDraft] = useState(initial.document.title);

  // Mirrors for the async pipeline.
  const pagesRef = useRef(pages);
  const docRef = useRef(doc);
  const stopRef = useRef(false);
  const fatalRef = useRef(false);
  const controllers = useRef(new Set<AbortController>());
  useEffect(() => {
    pagesRef.current = pages;
  }, [pages]);
  useEffect(() => {
    docRef.current = doc;
  }, [doc]);

  // ---------------------------------------------------------------------
  // Scans (IndexedDB → object URLs)

  const pageIds = pages.map((p) => p.id).join(",");
  useEffect(() => {
    let cancelled = false;
    const urls: string[] = [];
    void (async () => {
      const entries: [string, string][] = [];
      for (const p of pagesRef.current) {
        if (!p.hasImage) continue;
        const blob = await getScan(p.id);
        if (!blob) continue;
        const url = URL.createObjectURL(blob);
        urls.push(url);
        entries.push([p.id, url]);
      }
      if (cancelled) urls.forEach((u) => URL.revokeObjectURL(u));
      else setScans(Object.fromEntries(entries));
    })();
    return () => {
      cancelled = true;
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [pageIds]);

  // ---------------------------------------------------------------------
  // Derived

  const flags = useMemo(() => {
    const out: Record<string, KeyedFlag[]> = {};
    for (const p of pages) out[p.id] = computeFlags(p, glossary);
    return out;
  }, [pages, glossary]);

  const statuses = useMemo(
    () =>
      Object.fromEntries(
        pages.map((p) => [
          p.id,
          pageStatus(p, flags[p.id] ?? [], running[p.id]),
        ]),
      ),
    [pages, flags, running],
  );

  const stats = useMemo(() => {
    let open = 0;
    let bad = 0;
    for (const p of pages) {
      for (const f of flags[p.id] ?? []) {
        if (!isOpen(p, f) || p.reviewed) continue;
        open += 1;
        if (f.sev === "bad") bad += 1;
      }
    }
    return {
      pages: pages.length,
      read: pages.filter((p) => p.transcription).length,
      translated: pages.filter((p) => p.translation).length,
      reviewed: pages.filter((p) => p.reviewed).length,
      failed: pages.filter((p) => p.error).length,
      open,
      bad,
    };
  }, [pages, flags]);

  const pending = pages.some(
    (p) => !p.translation && (p.transcription || (p.hasImage && scans[p.id])),
  );

  // ---------------------------------------------------------------------
  // Page updates

  const replacePage = useCallback((page: Page) => {
    setPages((list) => list.map((p) => (p.id === page.id ? page : p)));
    pagesRef.current = pagesRef.current.map((p) =>
      p.id === page.id ? page : p,
    );
  }, []);

  const patchLocal = useCallback((id: string, patch: Partial<Page>) => {
    setPages((list) => list.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    pagesRef.current = pagesRef.current.map((p) =>
      p.id === id ? { ...p, ...patch } : p,
    );
  }, []);

  function onResult(page: Page, result: api.ApiResult<Page>): boolean {
    if (result.ok) {
      replacePage(result.data);
      return true;
    }
    patchLocal(page.id, { error: result.error });
    if (FATAL_ERRORS.includes(result.error)) {
      fatalRef.current = true;
      setFatal(result.error);
      stopRef.current = true;
    }
    return false;
  }

  const setRun = (id: string, step: "reading" | "translating" | null) =>
    setRunning((r) => {
      const next = { ...r };
      if (step) next[id] = step;
      else delete next[id];
      return next;
    });

  async function transcribeOne(page: Page): Promise<boolean> {
    const scan = await getScan(page.id);
    if (!scan) {
      patchLocal(page.id, { error: "no-scan" });
      return false;
    }
    const controller = new AbortController();
    controllers.current.add(controller);
    setRun(page.id, "reading");
    patchLocal(page.id, { error: null });
    try {
      const { images } = await imagesForTranscription(scan, {
        highRes: docRef.current.highRes,
        hasPdfText: page.hasPdfText,
      });
      return onResult(
        page,
        await api.transcribe(page.id, images, noteLang, controller.signal),
      );
    } catch {
      return false; // aborted
    } finally {
      controllers.current.delete(controller);
      setRun(page.id, null);
    }
  }

  async function translateOne(page: Page): Promise<boolean> {
    const controller = new AbortController();
    controllers.current.add(controller);
    setRun(page.id, "translating");
    patchLocal(page.id, { error: null });
    try {
      return onResult(
        page,
        await api.translate(page.id, noteLang, controller.signal),
      );
    } catch {
      return false;
    } finally {
      controllers.current.delete(controller);
      setRun(page.id, null);
    }
  }

  async function runAll(mode: "missing" | "retranslate") {
    if (active) return;
    setActive(true);
    setStopping(false);
    setFatal(null);
    setNotice(null);
    stopRef.current = false;
    fatalRef.current = false;
    try {
      const unread = pagesRef.current.filter(
        (p) => !p.transcription && p.hasImage && mode === "missing",
      );
      await pool(
        unread,
        2,
        async (p) => void (await transcribeOne(p)),
        () => stopRef.current,
      );
      if (!stopRef.current) {
        const toTranslate = pagesRef.current.filter(
          (p) => p.transcription && (mode === "retranslate" || !p.translation),
        );
        await pool(
          toTranslate,
          2,
          async (p) => void (await translateOne(p)),
          () => stopRef.current,
        );
      }
      if (stopRef.current && !fatalRef.current) setNotice(t.stopped);
    } finally {
      setActive(false);
      setStopping(false);
    }
  }

  async function runOne(
    page: Page,
    options: { reread: boolean; blocks?: Block[] | null },
  ) {
    if (active) return;
    setActive(true);
    setFatal(null);
    stopRef.current = false;
    fatalRef.current = false;
    try {
      let current = pagesRef.current.find((p) => p.id === page.id) ?? page;
      if (options.blocks) {
        const saved = await saveTranscriptionAction(page.id, options.blocks);
        if (!saved.ok) {
          patchLocal(page.id, { error: saved.error });
          return;
        }
        replacePage(saved.data);
        current = saved.data;
      }
      if (!current.transcription || options.reread) {
        if (!(await transcribeOne(current))) return;
        current = pagesRef.current.find((p) => p.id === page.id) ?? current;
      }
      if (current.transcription && !stopRef.current)
        await translateOne(current);
    } finally {
      setActive(false);
    }
  }

  function stop() {
    stopRef.current = true;
    setStopping(true);
    for (const c of controllers.current) c.abort();
  }

  // Start right after creation (`?run=1`), once. The flag is set when the
  // timer fires, not when it's scheduled: React's dev double-mount cancels
  // the first timer and must not block the second.
  const autoRan = useRef(false);
  const runAllRef = useRef(runAll);
  useEffect(() => {
    runAllRef.current = runAll;
  });
  useEffect(() => {
    if (search.get("run") !== "1") return;
    // Let the scans load first.
    const timer = setTimeout(() => {
      if (autoRan.current) return;
      autoRan.current = true;
      router.replace(`/documents/${doc.id}`, { scroll: false });
      void runAllRef.current("missing");
    }, 300);
    return () => clearTimeout(timer);
  }, [search, router, doc.id]);

  // Stop in-flight requests when leaving.
  useEffect(() => {
    const set = controllers.current;
    return () => {
      for (const c of set) c.abort();
    };
  }, []);

  // ---------------------------------------------------------------------
  // Review edits (auto-saved)

  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const save = useCallback(
    async (
      id: string,
      patch: { text?: string; resolved?: Page["resolved"]; reviewed?: boolean },
    ) => {
      setSaveStates((s) => ({ ...s, [id]: "saving" }));
      const result = await saveReviewAction(id, patch);
      setSaveStates((s) => ({ ...s, [id]: result.ok ? "saved" : "failed" }));
      return result;
    },
    [],
  );

  function onTextChange(page: Page, text: string) {
    if (!page.translation) return;
    patchLocal(page.id, { translation: { ...page.translation, text } });
    setSaveStates((s) => ({ ...s, [page.id]: "saving" }));
    clearTimeout(timers.current[page.id]);
    timers.current[page.id] = setTimeout(
      () => void save(page.id, { text }),
      800,
    );
  }

  // Flush pending saves when leaving the page.
  useEffect(() => {
    const pendingTimers = timers.current;
    const flush = () => {
      for (const [id, timer] of Object.entries(pendingTimers)) {
        clearTimeout(timer);
        const page = pagesRef.current.find((p) => p.id === id);
        if (page?.translation)
          void saveReviewAction(id, { text: page.translation.text });
      }
    };
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, []);

  async function onReviewChange(page: Page, change: ReviewChange) {
    clearTimeout(timers.current[page.id]);
    const text = change.text ?? page.translation?.text;
    patchLocal(page.id, {
      resolved: change.resolved,
      translation:
        page.translation && text !== undefined
          ? { ...page.translation, text }
          : page.translation,
    });
    await save(page.id, { resolved: change.resolved, text });
    if (change.glossary) {
      const result = await upsertGlossaryAction([
        { lang: doc.target, ...change.glossary },
      ]);
      if (result.ok) setGlossary(result.data);
    }
  }

  async function onToggleReviewed(page: Page) {
    const reviewed = !page.reviewed;
    patchLocal(page.id, { reviewed });
    const result = await save(page.id, { reviewed });
    if (!result.ok) patchLocal(page.id, { reviewed: !reviewed });
  }

  async function onClaudeEdit(
    page: Page,
    input: Omit<Parameters<typeof api.edit>[1], "translation" | "noteLang">,
  ): Promise<{ text: string; changed: string } | string> {
    const result = await api.edit(page.id, {
      ...input,
      translation:
        pagesRef.current.find((p) => p.id === page.id)?.translation?.text ?? "",
      noteLang,
    });
    return result.ok ? result.data : messages.errors[result.error];
  }

  // ---------------------------------------------------------------------
  // Document-level actions

  async function patchDocument(patch: Partial<DocumentInfo>) {
    const previous = doc;
    setDoc({ ...doc, ...patch });
    const result = await updateDocumentAction(doc.id, patch);
    if (result.ok) setDoc(result.data);
    else {
      setDoc(previous);
      setNotice(messages.errors[result.error]);
    }
  }

  async function onMove(page: Page, delta: -1 | 1) {
    const result = await movePageAction(page.id, delta);
    if (result.ok) setPages(result.data);
  }

  async function onRemove(page: Page) {
    const result = await deletePageAction(page.id);
    if (result.ok) {
      setPages((list) => list.filter((p) => p.id !== page.id));
      void deleteScans([page.id]);
    }
  }

  async function onAddFiles(files: File[]) {
    setAdding(true);
    try {
      const report = await ingestFiles(files, MAX_PAGES - pages.length);
      if (!report.pages.length) return;
      const result = await addPagesAction(
        doc.id,
        report.pages.map(toPageInput),
      );
      if (!result.ok) {
        setNotice(messages.errors[result.error]);
        return;
      }
      await Promise.all(
        result.data.map((p, i) => {
          const blob = report.pages[i]?.blob;
          return blob ? putScan(p.id, blob) : undefined;
        }),
      );
      setPages((list) => [...list, ...result.data]);
      setModal(null);
    } finally {
      setAdding(false);
    }
  }

  async function onDelete() {
    const ids = pages.map((p) => p.id);
    const result = await deleteDocumentAction(doc.id);
    if (result.ok) {
      void deleteScans(ids);
      router.push("/");
    } else setNotice(messages.errors[result.error]);
  }

  const exportTexts = messages.export;

  async function copyAll() {
    const N = pages.length;
    const text = pages
      .map(
        (p, i) =>
          `${fill(t.copyHeading, { page: i + 1, pages: N })}\n\n${p.translation?.text ?? TRANSLATION_TEXTS[doc.target].untranslated}`,
      )
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      setNotice(t.copied);
    } catch {
      setNotice(t.copyFailed);
    }
  }

  // ---------------------------------------------------------------------
  // Render

  const visible =
    filter === "all"
      ? pages
      : pages.filter(
          (p) =>
            !p.reviewed &&
            (p.error ||
              (flags[p.id] ?? []).some((f) => isOpen(p, f)) ||
              !p.translation),
        );

  const runLabel = active
    ? stopping
      ? t.stopping
      : t.running
    : pending
      ? stats.read > 0
        ? t.continue
        : t.run
      : t.allDone;

  const stat = (value: string | number, label: string, alert = false) => (
    <span className="flex items-baseline gap-1.5">
      <b
        className={`font-mono text-lg font-medium tabular-nums ${alert ? "text-warn" : ""}`}
      >
        {value}
      </b>
      <span className="text-[13px] text-muted">{label}</span>
    </span>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <TextInput
          aria-label={messages.newDocument.documentTitle}
          value={titleDraft}
          maxLength={200}
          onChange={(e) => setTitleDraft(e.target.value)}
          onBlur={() => {
            const title = titleDraft.trim();
            if (title && title !== doc.title) void patchDocument({ title });
            else setTitleDraft(doc.title);
          }}
          className="min-w-0 flex-1 font-display text-2xl font-semibold"
        />
      </div>

      <details className="sheet">
        <summary className="cursor-pointer px-5 py-3 font-medium">
          {t.settings} · {messages.labels.target[doc.target]} ·{" "}
          {messages.labels.doctype[doc.doctype]} ·{" "}
          {messages.labels.quality[doc.quality]}
        </summary>
        <div className="space-y-3 border-t border-line p-5">
          <DocSettingsFields
            value={doc}
            onChange={(patch) => void patchDocument(patch)}
            t={messages.docSettings}
            labels={messages.labels}
            disabled={active}
          />
          {pages.some(
            (p) => p.translation && p.translation.lang !== doc.target,
          ) && <p className="text-sm text-warn">{t.settingsTargetChanged}</p>}
        </div>
      </details>

      {/* Summary + actions, sticky under the header. */}
      <div className="sheet sticky top-2 z-10 flex flex-col gap-3 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2">
          <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
            {stat(stats.pages, t.stats.pages)}
            {stat(`${stats.read}/${stats.pages}`, t.stats.read)}
            {stat(`${stats.translated}/${stats.pages}`, t.stats.translated)}
            {stat(`${stats.reviewed}/${stats.pages}`, t.stats.reviewed)}
            {stat(stats.open, t.stats.open, stats.open > 0)}
            {stats.bad > 0 && stat(stats.bad, t.stats.bad, true)}
            {stats.failed > 0 && stat(stats.failed, t.stats.failed, true)}
          </div>
          <div className="flex flex-wrap gap-2">
            {active ? (
              <Button variant="outline" disabled={stopping} onClick={stop}>
                {stopping ? t.stopping : t.stop}
              </Button>
            ) : null}
            <Button
              variant="primary"
              disabled={active || !pending}
              onClick={() => void runAll("missing")}
            >
              {runLabel}
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            aria-label={t.filter.all}
            options={[
              { value: "all", label: t.filter.all },
              { value: "open", label: t.filter.open },
            ]}
            value={filter}
            onChange={setFilter}
          />
          <nav aria-label={t.jumpTo} className="flex flex-wrap gap-1">
            {pages.map((p, i) => {
              const s = statuses[p.id];
              const tone =
                s === "reviewed" || s === "done"
                  ? "border-ok text-ok"
                  : s === "check"
                    ? "border-warn text-warn"
                    : s === "error"
                      ? "border-bad text-bad"
                      : "border-line-strong text-muted";
              return (
                <a
                  key={p.id}
                  href={`#page-${i + 1}`}
                  className={`grid h-7 min-w-7 place-items-center rounded border px-1 font-mono text-xs hover:bg-sunken ${tone}`}
                  title={messages.labels.status[s ?? "idle"]}
                >
                  {i + 1}
                </a>
              );
            })}
          </nav>
          <span className="flex-1" />
          <Button
            size="sm"
            variant="outline"
            disabled={!stats.translated}
            onClick={() =>
              void exportTranslation({
                title: doc.title,
                target: doc.target,
                pages,
                settings,
              })
            }
          >
            {t.exportTranslation}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!stats.read}
            onClick={() =>
              void exportTranscription({
                title: doc.title,
                pages,
                t: exportTexts,
              })
            }
          >
            {t.exportTranscription}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!stats.translated}
            onClick={() => void copyAll()}
          >
            {t.copy}
          </Button>
        </div>
        {fatal && (
          <p
            role="alert"
            className="rounded-md bg-bad-soft px-3 py-2 text-sm text-bad"
          >
            {fill(t.fatal, { reason: messages.errors[fatal] })}
          </p>
        )}
        {notice && (
          <p className="text-sm text-muted" aria-live="polite">
            {notice}
          </p>
        )}
      </div>

      {visible.length === 0 && filter === "open" && (
        <p className="sheet px-5 py-8 text-center text-muted">{t.noOpen}</p>
      )}

      <div className="flex flex-col gap-5">
        {visible.map((page) => {
          const index = pages.indexOf(page);
          return (
            <PageCard
              key={page.id}
              page={page}
              index={index}
              total={pages.length}
              flags={flags[page.id] ?? []}
              status={statuses[page.id] ?? "idle"}
              scanUrl={scans[page.id] ?? null}
              target={doc.target}
              t={messages.pageCard}
              flagTexts={messages.flags}
              labels={messages.labels}
              errorText={
                page.error
                  ? (messages.errors[page.error as ErrorCode] ??
                    messages.errors.unknown)
                  : null
              }
              saveState={saveStates[page.id] ?? "idle"}
              canRun={!active}
              canUseClaude={!active}
              onTextChange={(text) => onTextChange(page, text)}
              onReviewChange={(change) => void onReviewChange(page, change)}
              onClaudeEdit={(input) => onClaudeEdit(page, input)}
              onRun={({ reread }) => void runOne(page, { reread })}
              onRetranslate={(blocks) =>
                void runOne(page, { reread: false, blocks })
              }
              onToggleReviewed={() => void onToggleReviewed(page)}
              onMove={(delta) => void onMove(page, delta)}
              onRemove={() => void onRemove(page)}
              onZoom={() => setZoom(scans[page.id] ?? null)}
            />
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 border-t border-line pt-5">
        <Button
          variant="outline"
          disabled={active || pages.length >= MAX_PAGES}
          onClick={() => setModal("add")}
        >
          + {t.addPages}
        </Button>
        <Button
          variant="outline"
          disabled={active || !stats.read}
          onClick={() => setModal("retranslate")}
        >
          {t.retranslateAll}
        </Button>
        <span className="flex-1" />
        <Button
          variant="danger"
          disabled={active}
          onClick={() => setModal("delete")}
        >
          {t.deleteDocument}
        </Button>
      </div>
      <p className="max-w-[80ch] text-[13px] text-muted">{t.footer}</p>

      <SimpleModal
        isOpen={zoom !== null}
        onClose={() => setZoom(null)}
        title={t.zoomTitle}
        size="full"
      >
        {zoom && (
          // eslint-disable-next-line @next/next/no-img-element -- local object URL
          <img
            src={zoom}
            alt=""
            className="mx-auto block max-w-full bg-white"
          />
        )}
      </SimpleModal>

      <SimpleModal
        isOpen={modal === "retranslate"}
        onClose={() => setModal(null)}
        title={t.retranslateConfirmTitle}
        description={t.retranslateConfirmText}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(null)}>
              {t.cancel}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setModal(null);
                void runAll("retranslate");
              }}
            >
              {t.confirm}
            </Button>
          </>
        }
      />

      <SimpleModal
        isOpen={modal === "delete"}
        onClose={() => setModal(null)}
        title={t.deleteConfirmTitle}
        description={t.deleteConfirmText}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(null)}>
              {t.cancel}
            </Button>
            <Button variant="danger" onClick={() => void onDelete()}>
              {t.deleteDocument}
            </Button>
          </>
        }
      />

      <SimpleModal
        isOpen={modal === "add"}
        onClose={() => !adding && setModal(null)}
        title={t.addPagesTitle}
        description={t.addPagesHint}
        isDismissable={!adding}
      >
        <FileDrop
          onFiles={(f) => void onAddFiles(f)}
          t={messages.fileDrop}
          busy={adding}
          compact
        />
      </SimpleModal>
    </div>
  );
}
