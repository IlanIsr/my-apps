"use client";

/**
 * One page on the workbench (shown one at a time). On one side the original:
 * the scan, or its transcription laid out like the page, each block framed
 * with its type. On the other, the review comments (numbered) and the
 * translation — editable (auto-saved), or shown in its final layout, block by
 * block like the original. Each open comment is highlighted right on the text
 * it is about, in the original and in the translation; clicking a highlight
 * opens its comment. Below, the Hebrew transcription (correct it, then
 * translate the page again).
 */

import { useRef, useState } from "react";

import {
  isOpen,
  type EditAction,
  type KeyedFlag,
  type PageStatus,
} from "@/lib/checks";
import { marksIn } from "@/lib/highlights";
import { translationBlocks } from "@/lib/layout";
import {
  blocksFromText,
  transcriptionText,
  type Block,
  type Page,
  type TargetLang,
} from "@/lib/model";

import { Button } from "./Button";
import { fill } from "./common";
import {
  DocumentLayout,
  MarkedText,
  type NumberedFlag,
} from "./DocumentLayout";
import { FlagList, type FlagTexts, type ReviewChange } from "./FlagList";
import type { LabelsTexts } from "./labels";
import { Segmented } from "./Segmented";
import { TextArea } from "./TextArea";

export type PageCardTexts = {
  page: string;
  scanAlt: string;
  zoom: string;
  noScanHere: string;
  originalView: string;
  viewScan: string;
  viewText: string;
  comments: string;
  translationLabel: string;
  translationView: string;
  viewEdit: string;
  viewLayout: string;
  layoutHint: string;
  placeholderIdle: string;
  placeholderRead: string;
  placeholderReading: string;
  placeholderTranslating: string;
  saving: string;
  saveFailed: string;
  transcription: string;
  transcriptionHint: string;
  retranslate: string;
  retranslateEdited: string;
  run: string;
  retry: string;
  reread: string;
  markReviewed: string;
  reviewed: string;
  unmarkReviewed: string;
  openFlags: string;
  moveUp: string;
  moveDown: string;
  remove: string;
  confirmRemove: string;
};

export type SaveState = "idle" | "saving" | "saved" | "failed";

const STATUS_STYLE: Record<PageStatus, string> = {
  idle: "bg-info-soft text-info",
  read: "bg-info-soft text-info",
  reading: "bg-accent-soft text-accent pulse",
  translating: "bg-accent-soft text-accent pulse",
  check: "bg-warn-soft text-warn",
  done: "bg-ok-soft text-ok",
  reviewed: "bg-ok-soft text-ok",
  error: "bg-bad-soft text-bad",
};

export function PageCard({
  page,
  index,
  total,
  flags,
  status,
  scanUrl,
  target,
  t,
  flagTexts,
  labels,
  errorText,
  saveState,
  canRun,
  canUseClaude,
  onTextChange,
  onReviewChange,
  onClaudeEdit,
  onRun,
  onRetranslate,
  onToggleReviewed,
  onMove,
  onRemove,
  onZoom,
}: {
  page: Page;
  index: number;
  total: number;
  flags: KeyedFlag[];
  status: PageStatus;
  scanUrl: string | null;
  target: TargetLang;
  t: PageCardTexts;
  flagTexts: FlagTexts;
  labels: LabelsTexts;
  errorText: string | null;
  saveState: SaveState;
  canRun: boolean;
  canUseClaude: boolean;
  onTextChange: (text: string) => void;
  onReviewChange: (change: ReviewChange) => void;
  onClaudeEdit: Parameters<typeof FlagList>[0]["onClaudeEdit"];
  /** Transcribe (if needed) then translate. */
  onRun: (options: { reread: boolean }) => void;
  /** Translate again, after saving an edited transcription if given. */
  onRetranslate: (blocks: Block[] | null) => void;
  onToggleReviewed: () => void;
  onMove: (delta: -1 | 1) => void;
  onRemove: () => void;
  onZoom: () => void;
}) {
  const textRef = useRef<HTMLTextAreaElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const [trText, setTrText] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [originalView, setOriginalView] = useState<"scan" | "text">("scan");
  const [translationView, setTranslationView] = useState<"edit" | "layout">(
    "edit",
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [action, setAction] = useState<EditAction | null>(null);
  const transcriptionValue =
    trText ?? (page.transcription ? transcriptionText(page.transcription) : "");
  const trDirty = trText !== null;
  const busy = status === "reading" || status === "translating";
  const openCount = flags.filter((f) => isOpen(page, f)).length;

  const numbers: Record<string, number> = {};
  flags.forEach((f, i) => (numbers[f.key] = i + 1));
  /** Only the open comments are highlighted on the text. */
  const marked: NumberedFlag[] = flags
    .filter((f) => isOpen(page, f))
    .map((flag) => ({ flag, n: numbers[flag.key] ?? 0 }));
  const translationValue = page.translation?.text ?? "";

  function select(key: string | null, from: "text" | "list") {
    setSelected(key);
    setAction(null);
    if (!key) return;
    if (from === "text") {
      document
        .getElementById(`flag-${key}`)
        ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    } else {
      cardRef.current
        ?.querySelector(`[data-key="${CSS.escape(key)}"]`)
        ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }

  /** A click / caret move inside a highlight of the translation opens its
   * comment (unless an edit is under way). */
  function onCaret(el: HTMLTextAreaElement) {
    if (action || el.selectionStart !== el.selectionEnd) return;
    const pos = el.selectionStart;
    const mark = marksIn(el.value, marked, "target").find(
      (m) => m.start <= pos && pos <= m.end,
    );
    if (mark && mark.key !== selected) select(mark.key, "text");
  }

  const placeholder =
    status === "reading"
      ? t.placeholderReading
      : status === "translating"
        ? t.placeholderTranslating
        : page.transcription
          ? t.placeholderRead
          : t.placeholderIdle;

  const showScan =
    scanUrl && (originalView === "scan" || !page.transcription)
      ? scanUrl
      : null;
  const aspect = page.width && page.height ? page.width / page.height : null;

  return (
    <article
      ref={cardRef}
      className="sheet overflow-hidden"
      aria-label={fill(t.page, { n: index + 1 })}
    >
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line bg-sunken px-4 py-2.5">
        <h3 className="text-base">{fill(t.page, { n: index + 1 })}</h3>
        <span className="text-[13px] text-muted">
          {labels.origin[page.origin]}
        </span>
        <span className="flex-1" />
        {openCount > 0 && status !== "reviewed" && (
          <span className="text-xs text-warn">
            {fill(t.openFlags, { n: openCount })}
          </span>
        )}
        <span className={`pill ${STATUS_STYLE[status]}`}>
          {labels.status[status]}
        </span>
        <div className="flex gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            isIconOnly
            aria-label={t.moveUp}
            disabled={index === 0 || busy || !canRun}
            onClick={() => onMove(-1)}
          >
            <span aria-hidden>↑</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            isIconOnly
            aria-label={t.moveDown}
            disabled={index === total - 1 || busy || !canRun}
            onClick={() => onMove(1)}
          >
            <span aria-hidden>↓</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            isIconOnly
            aria-label={t.remove}
            disabled={busy || !canRun}
            onClick={() => setConfirmRemove(true)}
          >
            <span aria-hidden>✕</span>
          </Button>
        </div>
      </header>

      {confirmRemove && (
        <div className="flex flex-wrap items-center gap-2 border-b border-line bg-bad-soft px-4 py-2 text-sm">
          <span>{t.confirmRemove}</span>
          <Button size="sm" variant="danger" onClick={onRemove}>
            {t.remove}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setConfirmRemove(false)}
          >
            ✕
          </Button>
        </div>
      )}

      <div className="grid lg:grid-cols-2">
        <figure className="m-0 min-w-0 border-b border-line bg-sunken p-4 lg:border-e lg:border-b-0">
          <div className="flex flex-col gap-3 lg:sticky lg:top-40">
            {scanUrl && page.transcription && (
              <Segmented
                aria-label={t.originalView}
                options={[
                  { value: "scan", label: t.viewScan },
                  { value: "text", label: t.viewText },
                ]}
                value={originalView}
                onChange={setOriginalView}
              />
            )}
            {showScan ? (
              <Button
                variant="ghost"
                onClick={onZoom}
                aria-label={t.zoom}
                className="block h-auto w-full cursor-zoom-in p-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- local object URL */}
                <img
                  src={showScan}
                  alt={fill(t.scanAlt, { n: index + 1 })}
                  className="mx-auto block h-auto max-h-[calc(100dvh-14rem)] w-auto max-w-full rounded-sm border border-line bg-white object-contain shadow-md"
                />
              </Button>
            ) : page.transcription ? (
              <div className="max-h-[calc(100dvh-14rem)] overflow-auto p-1 pt-3">
                <DocumentLayout
                  blocks={page.transcription.blocks}
                  flags={marked}
                  side="source"
                  selected={selected}
                  onSelect={(key) => select(key, "text")}
                  aspect={aspect}
                  blockLabels={labels.block}
                />
              </div>
            ) : (
              <p className="text-sm text-muted">{t.noScanHere}</p>
            )}
            {page.hasImage && !scanUrl && page.transcription && (
              <p className="text-xs text-muted">{t.noScanHere}</p>
            )}
            <figcaption className="text-xs break-words text-muted">
              {page.source}
            </figcaption>
          </div>
        </figure>

        <div className="flex min-w-0 flex-col gap-4 p-4">
          {errorText && (
            <div
              role="alert"
              className="flex flex-wrap items-center gap-2 rounded-md bg-bad-soft px-3 py-2 text-sm text-bad"
            >
              <span>{errorText}</span>
              <Button
                size="sm"
                variant="outline"
                disabled={!canRun}
                onClick={() => onRun({ reread: false })}
              >
                {t.retry}
              </Button>
            </div>
          )}

          {flags.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="eyebrow">{t.comments}</span>
              <FlagList
                page={page}
                flags={flags}
                numbers={numbers}
                selected={selected}
                action={action}
                onSelect={(key) => select(key, "list")}
                onAction={setAction}
                t={flagTexts}
                target={target}
                canUseClaude={canUseClaude}
                onChange={onReviewChange}
                onClaudeEdit={onClaudeEdit}
                getSelection={() => {
                  const el = textRef.current;
                  return el
                    ? el.value.slice(el.selectionStart, el.selectionEnd)
                    : "";
                }}
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <label htmlFor={`tl-${page.id}`} className="eyebrow">
                {t.translationLabel}
              </label>
              <span
                className={`flex-1 text-xs ${saveState === "failed" ? "text-bad" : "text-muted"}`}
                aria-live="polite"
              >
                {saveState === "saving"
                  ? t.saving
                  : saveState === "failed"
                    ? t.saveFailed
                    : ""}
              </span>
              {page.translation && (
                <Segmented
                  aria-label={t.translationView}
                  options={[
                    { value: "edit", label: t.viewEdit },
                    { value: "layout", label: t.viewLayout },
                  ]}
                  value={translationView}
                  onChange={setTranslationView}
                />
              )}
            </div>
            {translationView === "layout" && page.translation ? (
              <>
                <DocumentLayout
                  blocks={translationBlocks(page)}
                  flags={marked}
                  side="target"
                  selected={selected}
                  onSelect={(key) => select(key, "text")}
                  aspect={aspect}
                />
                <p className="text-xs text-muted">{t.layoutHint}</p>
              </>
            ) : (
              <div className="marked-editor">
                <div aria-hidden className="doc-area marked-backdrop">
                  <MarkedText
                    text={translationValue}
                    flags={marked}
                    side="target"
                    selected={selected}
                    transparent
                  />
                  {"​"}
                </div>
                <TextArea
                  ref={textRef}
                  id={`tl-${page.id}`}
                  lang={target}
                  dir="ltr"
                  spellCheck
                  disabled={!page.translation}
                  placeholder={placeholder}
                  value={translationValue}
                  onChange={(e) => onTextChange(e.target.value)}
                  onSelect={(e) => onCaret(e.currentTarget)}
                  className="doc-area marked-input"
                />
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {!page.translation && !busy && (
              <Button
                size="sm"
                variant="primary"
                disabled={!canRun}
                onClick={() => onRun({ reread: false })}
              >
                {t.run}
              </Button>
            )}
            {page.translation && (
              <Button
                size="sm"
                variant={page.reviewed ? "outline" : "primary"}
                disabled={busy}
                onClick={onToggleReviewed}
              >
                {page.reviewed ? t.unmarkReviewed : t.markReviewed}
              </Button>
            )}
          </div>

          {page.transcription && (
            <details className="rounded-md border border-line">
              <summary className="cursor-pointer px-3 py-2 text-sm font-medium">
                {t.transcription}
              </summary>
              <div className="flex flex-col gap-2.5 border-t border-line p-3">
                <TextArea
                  dir="rtl"
                  lang="he"
                  spellCheck={false}
                  value={transcriptionValue}
                  onChange={(e) => setTrText(e.target.value)}
                  className="he-area"
                  aria-label={t.transcription}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant={trDirty ? "primary" : "outline"}
                    disabled={!canRun || busy}
                    onClick={() => {
                      onRetranslate(
                        trDirty
                          ? blocksFromText(
                              transcriptionValue,
                              page.transcription!.blocks,
                            )
                          : null,
                      );
                      setTrText(null);
                    }}
                  >
                    {trDirty ? t.retranslateEdited : t.retranslate}
                  </Button>
                  {page.hasImage && scanUrl && (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={!canRun || busy}
                      onClick={() => {
                        setTrText(null);
                        onRun({ reread: true });
                      }}
                    >
                      {t.reread}
                    </Button>
                  )}
                  <span className="text-xs text-muted">
                    {t.transcriptionHint}
                  </span>
                </div>
              </div>
            </details>
          )}
        </div>
      </div>
    </article>
  );
}
