"use client";

/**
 * A page's review flags, next to its translation. An open flag (warn / bad)
 * offers four actions — replace, add, remove, keep as is — each opening an
 * inline editor: apply it by hand (exact text edit, all occurrences on
 * request) or let Claude apply it (adjusting the grammar around it). A
 * resolved flag shows what was done, with "reopen" / "undo".
 */

import { useState } from "react";

import {
  defaultPassage,
  editText,
  isOpen,
  occurrences,
  type AddPosition,
  type EditAction,
  type KeyedFlag,
} from "@/lib/checks";
import type { Page, Resolution, TargetLang } from "@/lib/model";

import { Button } from "./Button";
import { Checkbox } from "./Checkbox";
import { fill } from "./common";
import { Field } from "./DocSettingsFields";
import { Select } from "./Select";
import { TextArea } from "./TextArea";
import { TextInput } from "./TextInput";

export type FlagTexts = {
  tag: Record<KeyedFlag["kind"], string>;
  msg: {
    sourceDocx: string;
    sourcePdfText: string;
    sourcePdfDiscarded: string;
    discardReason: Record<string, string>;
    illegible: string;
    idValid: string;
    idInvalid: string;
    numbersMissing: string;
    numbersAdded: string;
    numbersOk: string;
    hebrewLeft: string;
    glossary: string;
    cutStart: string;
    cutEnd: string;
  };
  actions: Record<EditAction, string>;
  passage: string;
  passageAnchor: string;
  passagePlaceholder: string;
  useSelection: string;
  selectFirst: string;
  found: string;
  notFound: string;
  needPassage: string;
  noAnchorNeeded: string;
  replaceWith: string;
  textToAdd: string;
  newTextPlaceholder: string;
  where: string;
  positions: Record<AddPosition, string>;
  notePrefix: Record<TargetLang, string>;
  allOccurrences: string;
  addToGlossary: string;
  keepHint: string;
  apply: string;
  validate: string;
  letClaude: string;
  claudeWorking: string;
  close: string;
  reopen: string;
  undo: string;
  errWriteReplace: string;
  errWriteAdd: string;
  errPassage: string;
  errNotFound: string;
  done: {
    kept: string;
    replaced: string;
    removed: string;
    added: string;
    byClaude: string;
    glossaryAdded: string;
  };
};

const SEV_STYLE: Record<KeyedFlag["sev"], string> = {
  info: "bg-info-soft [--tag:var(--info)]",
  ok: "bg-ok-soft [--tag:var(--ok)]",
  warn: "bg-warn-soft [--tag:var(--warn)]",
  bad: "bg-bad-soft [--tag:var(--bad)]",
};

/** "→" pointing in the reading direction. */
function Arrow() {
  return (
    <span aria-hidden className="inline-block rtl:-scale-x-100">
      →
    </span>
  );
}

export function FlagMessage({ flag, t }: { flag: KeyedFlag; t: FlagTexts }) {
  const m = t.msg;
  switch (flag.kind) {
    case "source-docx":
      return <>{m.sourceDocx}</>;
    case "source-pdf-text":
      return <>{m.sourcePdfText}</>;
    case "source-pdf-discarded":
      return (
        <>
          {fill(m.sourcePdfDiscarded, {
            reason: m.discardReason[flag.reason] ?? flag.reason,
          })}
        </>
      );
    case "reading":
    case "doubt":
      return <span dir="auto">{flag.text}</span>;
    case "illegible":
      return <>{fill(m.illegible, { n: flag.count })}</>;
    case "id-valid":
      return (
        <span className="font-mono">{fill(m.idValid, { n: flag.number })}</span>
      );
    case "id-invalid":
      return (
        <span className="font-mono">
          {fill(m.idInvalid, { n: flag.number })}
        </span>
      );
    case "numbers-missing":
      return (
        <span className="font-mono">
          {fill(m.numbersMissing, { list: flag.numbers.join(", ") })}
        </span>
      );
    case "numbers-added":
      return (
        <span className="font-mono">
          {fill(m.numbersAdded, { list: flag.numbers.join(", ") })}
        </span>
      );
    case "numbers-ok":
      return <>{fill(m.numbersOk, { n: flag.count })}</>;
    case "hebrew-left":
      return (
        <>
          {m.hebrewLeft}{" "}
          <bdi dir="rtl" lang="he" className="font-he text-[15px]">
            {flag.sample}
          </bdi>
        </>
      );
    case "glossary":
      return (
        <>
          <bdi dir="rtl" lang="he" className="font-he text-[15px]">
            {flag.source}
          </bdi>{" "}
          <Arrow /> <bdi>{flag.rendering}</bdi> · {m.glossary}
        </>
      );
    case "term":
      return (
        <>
          <bdi dir="rtl" lang="he" className="font-he text-[15px]">
            {flag.term.source}
          </bdi>{" "}
          <Arrow /> <bdi>{flag.term.rendering}</bdi>
          {flag.term.note && (
            <>
              {" · "}
              <bdi>{flag.term.note}</bdi>
            </>
          )}
        </>
      );
    case "cut-start":
      return <>{m.cutStart}</>;
    case "cut-end":
      return <>{m.cutEnd}</>;
  }
}

/** Plain-text version of a flag, sent to Claude as the remark's context. */
function flagContext(flag: KeyedFlag): string {
  switch (flag.kind) {
    case "term":
      return `${flag.term.source} → ${flag.term.rendering}`;
    case "glossary":
      return `${flag.source} must be rendered as "${flag.rendering}"`;
    case "reading":
    case "doubt":
      return flag.text;
    case "id-invalid":
      return `ID number ${flag.number} has an invalid check digit`;
    case "numbers-missing":
      return `Numbers missing from the translation: ${flag.numbers.join(", ")}`;
    case "numbers-added":
      return `Numbers in the translation but not in the original: ${flag.numbers.join(", ")}`;
    case "hebrew-left":
      return `Hebrew left untranslated: ${flag.sample}`;
    default:
      return flag.kind;
  }
}

export type ReviewChange = {
  text?: string;
  resolved: Record<string, Resolution>;
  glossary?: { source: string; rendering: string };
};

export function FlagList({
  page,
  flags,
  t,
  target,
  canUseClaude,
  onChange,
  onClaudeEdit,
  getSelection,
}: {
  page: Page;
  flags: KeyedFlag[];
  t: FlagTexts;
  target: TargetLang;
  canUseClaude: boolean;
  onChange: (change: ReviewChange) => void;
  onClaudeEdit: (input: {
    action: "replace" | "add" | "remove";
    passage: string;
    newText: string;
    position: AddPosition | null;
    remark: string;
  }) => Promise<{ text: string; changed: string } | string>;
  /** The text currently selected in the translation editor. */
  getSelection: () => string;
}) {
  if (!flags.length) return null;
  return (
    <ul className="flex flex-col gap-1.5">
      {flags.map((flag) => (
        <FlagItem
          key={flag.key}
          flag={flag}
          page={page}
          t={t}
          target={target}
          canUseClaude={canUseClaude}
          onChange={onChange}
          onClaudeEdit={onClaudeEdit}
          getSelection={getSelection}
        />
      ))}
    </ul>
  );
}

function FlagItem({
  flag,
  page,
  t,
  target,
  canUseClaude,
  onChange,
  onClaudeEdit,
  getSelection,
}: {
  flag: KeyedFlag;
  page: Page;
  t: FlagTexts;
  target: TargetLang;
  canUseClaude: boolean;
  onChange: (change: ReviewChange) => void;
  onClaudeEdit: Parameters<typeof FlagList>[0]["onClaudeEdit"];
  getSelection: () => string;
}) {
  const [action, setAction] = useState<EditAction | null>(null);
  const resolution = page.resolved[flag.key];
  const open = isOpen(page, flag);
  const translation = page.translation?.text ?? "";

  function unresolve(restore?: string) {
    const resolved = { ...page.resolved };
    delete resolved[flag.key];
    onChange({ resolved, text: restore });
  }

  return (
    <li
      className={`grid grid-cols-[auto_minmax(0,1fr)] items-start gap-2 rounded-md px-2.5 py-2 text-[13.5px] ${
        resolution ? "bg-sunken" : SEV_STYLE[flag.sev]
      }`}
    >
      <i className="rounded bg-surface px-1.5 py-0.5 text-[11px] font-semibold tracking-wide whitespace-nowrap text-[var(--tag)] not-italic uppercase">
        {t.tag[flag.kind]}
      </i>
      <div className="flex min-w-0 flex-col gap-2">
        <span className={resolution ? "text-muted" : undefined}>
          <FlagMessage flag={flag} t={t} />
        </span>

        {resolution && (
          <div className="flex flex-wrap items-center gap-2 font-medium text-ok">
            <span>
              ✓ <bdi>{resolution.label}</bdi>
            </span>
            {resolution.after === null ? (
              <Button variant="outline" size="sm" onClick={() => unresolve()}>
                {t.reopen}
              </Button>
            ) : (
              translation === resolution.after &&
              resolution.before !== null && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => unresolve(resolution.before ?? undefined)}
                >
                  {t.undo}
                </Button>
              )
            )}
          </div>
        )}

        {open && page.translation && (
          <div className="flex flex-wrap gap-1.5">
            {(["replace", "add", "remove", "keep"] as const).map((a) => (
              <Button
                key={a}
                size="sm"
                variant={action === a ? "primary" : "outline"}
                onClick={() => setAction(action === a ? null : a)}
              >
                {t.actions[a]}
              </Button>
            ))}
          </div>
        )}

        {open && action && page.translation && (
          <FlagEditor
            key={action}
            flag={flag}
            action={action}
            page={page}
            t={t}
            target={target}
            canUseClaude={canUseClaude}
            onClose={() => setAction(null)}
            onChange={(change) => {
              setAction(null);
              onChange(change);
            }}
            onClaudeEdit={onClaudeEdit}
            getSelection={getSelection}
          />
        )}
      </div>
    </li>
  );
}

function FlagEditor({
  flag,
  action,
  page,
  t,
  target,
  canUseClaude,
  onClose,
  onChange,
  onClaudeEdit,
  getSelection,
}: {
  flag: KeyedFlag;
  action: EditAction;
  page: Page;
  t: FlagTexts;
  target: TargetLang;
  canUseClaude: boolean;
  onClose: () => void;
  onChange: (change: ReviewChange) => void;
  onClaudeEdit: Parameters<typeof FlagList>[0]["onClaudeEdit"];
  getSelection: () => string;
}) {
  const translation = page.translation?.text ?? "";
  const glossarySource =
    flag.kind === "term"
      ? flag.term.source
      : flag.kind === "glossary"
        ? flag.source
        : null;
  const [passage, setPassage] = useState(defaultPassage(flag));
  const [newText, setNewText] = useState(
    flag.kind === "glossary" && action === "replace" ? flag.rendering : "",
  );
  const [position, setPosition] = useState<AddPosition>("after");
  const [all, setAll] = useState(
    flag.kind === "term" || flag.kind === "glossary",
  );
  const [toGlossary, setToGlossary] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  const count = occurrences(translation, passage);
  const needsPassage =
    action === "replace" ||
    action === "remove" ||
    (action === "add" && (position === "after" || position === "before"));

  const foundText = !passage
    ? needsPassage
      ? t.needPassage
      : t.noAnchorNeeded
    : count
      ? fill(t.found, { n: count })
      : t.notFound;

  function check(): string | null {
    if ((action === "replace" || action === "add") && !newText.trim()) {
      return action === "replace" ? t.errWriteReplace : t.errWriteAdd;
    }
    return null;
  }

  function resolvedWith(label: string, after: string | null) {
    return {
      ...page.resolved,
      [flag.key]: {
        label: toGlossary ? `${label} · ${t.done.glossaryAdded}` : label,
        before: after === null ? null : translation,
        after,
      },
    };
  }

  function glossaryChange(rendering: string) {
    return toGlossary && glossarySource
      ? { source: glossarySource, rendering }
      : undefined;
  }

  function apply() {
    setError(null);
    if (action === "keep") {
      const rendering =
        flag.kind === "term"
          ? flag.term.rendering
          : flag.kind === "glossary"
            ? flag.rendering
            : "";
      onChange({
        resolved: resolvedWith(t.done.kept, null),
        glossary: glossaryChange(rendering),
      });
      return;
    }
    const problem = check();
    if (problem) return setError(problem);
    if (needsPassage && !passage) return setError(t.errPassage);
    if (needsPassage && !count) return setError(t.errNotFound);
    const out = editText(
      translation,
      action,
      passage,
      newText.trim(),
      action === "add" ? position : null,
      all && count > 1,
      t.notePrefix[target],
    );
    const label =
      action === "replace"
        ? fill(t.done.replaced, { from: passage, to: newText.trim() })
        : action === "remove"
          ? fill(t.done.removed, { text: passage })
          : fill(t.done.added, {
              text: newText.trim(),
              where: t.positions[position].toLocaleLowerCase(),
            });
    onChange({
      text: out,
      resolved: resolvedWith(label, out),
      glossary: glossaryChange(newText.trim()),
    });
  }

  async function letClaude() {
    if (action === "keep") return;
    setError(null);
    const problem = check();
    if (problem) return setError(problem);
    setWorking(true);
    const result = await onClaudeEdit({
      action,
      passage: passage.trim(),
      newText: newText.trim(),
      position: action === "add" ? position : null,
      remark: flagContext(flag),
    });
    setWorking(false);
    if (typeof result === "string") return setError(result);
    onChange({
      text: result.text,
      resolved: resolvedWith(
        fill(t.done.byClaude, { what: result.changed }),
        result.text,
      ),
      glossary: glossaryChange(newText.trim()),
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border border-line bg-surface p-3">
      {action !== "keep" && (
        <Field label={action === "add" ? t.passageAnchor : t.passage}>
          <TextInput
            dir="auto"
            value={passage}
            placeholder={t.passagePlaceholder}
            onChange={(e) => setPassage(e.target.value)}
            className="font-doc"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const selected = getSelection();
                if (selected.trim()) {
                  setPassage(selected);
                  setHint(null);
                } else setHint(t.selectFirst);
              }}
            >
              {t.useSelection}
            </Button>
            <span className="text-xs text-muted">{hint ?? foundText}</span>
          </div>
        </Field>
      )}

      {(action === "replace" || action === "add") && (
        <Field label={action === "replace" ? t.replaceWith : t.textToAdd}>
          <TextArea
            dir="auto"
            rows={2}
            value={newText}
            placeholder={t.newTextPlaceholder}
            onChange={(e) => setNewText(e.target.value)}
            className="font-doc"
            autoFocus
          />
        </Field>
      )}

      {action === "add" && (
        <Field label={t.where}>
          <Select
            aria-label={t.where}
            options={(["after", "before", "end", "note"] as const).map((k) => ({
              key: k,
              label: t.positions[k],
            }))}
            value={position}
            onChange={(v) => setPosition(v as AddPosition)}
          />
        </Field>
      )}

      {action !== "keep" && count > 1 && (
        <Checkbox checked={all} onChange={setAll}>
          <span className="text-sm">{t.allOccurrences}</span>
        </Checkbox>
      )}

      {glossarySource && (action === "replace" || action === "keep") && (
        <Checkbox checked={toGlossary} onChange={setToGlossary}>
          <span className="text-sm">{t.addToGlossary}</span>
        </Checkbox>
      )}

      {action === "keep" && <p className="text-sm text-muted">{t.keepHint}</p>}

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="primary" disabled={working} onClick={apply}>
          {action === "keep" ? t.validate : t.apply}
        </Button>
        {action !== "keep" && canUseClaude && (
          <Button
            size="sm"
            variant="outline"
            disabled={working}
            onClick={() => void letClaude()}
          >
            {working ? t.claudeWorking : t.letClaude}
          </Button>
        )}
        <Button size="sm" variant="ghost" disabled={working} onClick={onClose}>
          {t.close}
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-bad">
          {error}
        </p>
      )}
    </div>
  );
}
