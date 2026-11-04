/**
 * Automatic checks on a page, without AI — they run in the browser on every
 * change. Each check yields a **flag**: a severity, a kind (worded by the UI
 * in the active language) and its data. Flags with severity `warn` / `bad`
 * are "open" until the reviewer resolves them (`Page.resolved`, by key).
 *
 * - Israeli ID numbers (ת.ז.) near their label: the check digit is verified.
 * - Every number of the original must appear in the translation, and the
 *   other way round (multiset comparison).
 * - Hebrew letters left in the translation.
 * - The firm's glossary: a term present in the original whose imposed
 *   rendering is missing from the translation.
 * - Claude's own notes: reading problems, terms to check, doubtful passages.
 */

import type { GlossaryEntry, Page, Term } from "./model";

export type Severity = "info" | "ok" | "warn" | "bad";

export type Flag =
  | { kind: "source-docx"; sev: "info" }
  | { kind: "source-pdf-text"; sev: "info" }
  | { kind: "source-pdf-discarded"; sev: "info"; reason: string }
  | { kind: "reading"; sev: "warn"; text: string }
  | { kind: "illegible"; sev: "warn"; count: number }
  | { kind: "id-valid"; sev: "ok"; number: string }
  | { kind: "id-invalid"; sev: "bad"; number: string }
  | { kind: "numbers-missing"; sev: "bad"; numbers: string[] }
  | { kind: "numbers-added"; sev: "warn"; numbers: string[] }
  | { kind: "numbers-ok"; sev: "ok"; count: number }
  | { kind: "hebrew-left"; sev: "warn"; sample: string }
  | { kind: "glossary"; sev: "warn"; source: string; rendering: string }
  | { kind: "term"; sev: "warn"; term: Term }
  | { kind: "doubt"; sev: "warn"; text: string }
  | { kind: "cut-start"; sev: "info" }
  | { kind: "cut-end"; sev: "info" };

export type KeyedFlag = Flag & { key: string };

export type PageStatus =
  | "idle"
  | "reading"
  | "read"
  | "translating"
  | "check"
  | "done"
  | "reviewed"
  | "error";

/** Valid Israeli ID number (Luhn-like check digit, padded to 9). */
export function validIsraeliId(digits: string): boolean {
  if (!/^\d{5,9}$/.test(digits)) return false;
  const d = digits.padStart(9, "0");
  let sum = 0;
  for (let i = 0; i < 9; i += 1) {
    let x = Number(d[i]) * ((i % 2) + 1);
    if (x > 9) x -= 9;
    sum += x;
  }
  return sum % 10 === 0;
}

/** Every run of digits, leading zeros dropped (so 05 = 5). */
export function numbersOf(text: string): string[] {
  return (text.match(/\d+/g) ?? []).map((n) => n.replace(/^0+(?=\d)/, ""));
}

/** Items of `a` not matched one-for-one in `b`. */
export function multisetDiff(a: string[], b: string[]): string[] {
  const counts = new Map<string, number>();
  for (const x of b) counts.set(x, (counts.get(x) ?? 0) + 1);
  const out: string[] = [];
  for (const x of a) {
    const c = counts.get(x) ?? 0;
    if (c > 0) counts.set(x, c - 1);
    else out.push(x);
  }
  return out;
}

const ID_LABEL =
  /(ת\.\s?ז\.?|ת"ז|ת״ז|תעודת\s+זהות|מס['׳]?\s*זהות|ת\.ז)[^\d\n]{0,14}(\d{8}-\d(?!\d)|\d{5,9}(?!\d))/g;

/** Hebrew letters + the niqqud / punctuation that only appear with them. */
const HEBREW_RUN = /[֐-׿][֐-׿"'׳״\s.-]*/g;

function normalizeForMatch(s: string): string {
  return s.toLocaleLowerCase().replace(/\s+/g, " ").trim();
}

/** Hebrew without niqqud / cantillation, quotes unified — for glossary lookups. */
export function normalizeHebrew(s: string): string {
  return s
    .replace(/[֑-ׇ]/g, "")
    .replace(/[״"]/g, '"')
    .replace(/[׳']/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function flagKey(f: Flag): string {
  switch (f.kind) {
    case "id-valid":
    case "id-invalid":
      return `${f.kind}|${f.number}`;
    case "numbers-missing":
    case "numbers-added":
      return `${f.kind}|${f.numbers.join(",")}`;
    case "term":
      return `term|${f.term.source}`;
    case "glossary":
      return `glossary|${f.source}`;
    case "reading":
    case "doubt":
      return `${f.kind}|${f.text}`;
    case "hebrew-left":
      return `hebrew-left|${f.sample}`;
    case "source-pdf-discarded":
      return `${f.kind}|${f.reason}`;
    case "illegible":
      return `illegible|${f.count}`;
    case "numbers-ok":
      return `numbers-ok|${f.count}`;
    default:
      return f.kind;
  }
}

export function computeFlags(
  page: Page,
  glossary: readonly GlossaryEntry[],
): KeyedFlag[] {
  const flags: Flag[] = [];
  if (page.origin === "docx") flags.push({ kind: "source-docx", sev: "info" });
  if (page.hasPdfText) flags.push({ kind: "source-pdf-text", sev: "info" });
  if (page.textNote) {
    flags.push({
      kind: "source-pdf-discarded",
      sev: "info",
      reason: page.textNote,
    });
  }

  const tr = page.transcription;
  if (tr) {
    const src = tr.blocks.map((b) => b.text).join("\n");
    if (tr.notes) flags.push({ kind: "reading", sev: "warn", text: tr.notes });
    const illegible = (src.match(/\[(illisible|illegible|לא קריא)/gi) ?? [])
      .length;
    if (illegible)
      flags.push({ kind: "illegible", sev: "warn", count: illegible });

    const seen = new Set<string>();
    for (const m of src.matchAll(ID_LABEL)) {
      const digits = (m[2] ?? "").replace(/\D/g, "");
      if (seen.has(digits) || digits.length < 5 || digits.length > 9) continue;
      seen.add(digits);
      flags.push(
        validIsraeliId(digits)
          ? { kind: "id-valid", sev: "ok", number: digits }
          : { kind: "id-invalid", sev: "bad", number: digits },
      );
    }

    const tl = page.translation;
    if (tl) {
      const a = numbersOf(src);
      const b = numbersOf(tl.text);
      const missing = [...new Set(multisetDiff(a, b))];
      const added = [...new Set(multisetDiff(b, a))];
      if (missing.length) {
        flags.push({ kind: "numbers-missing", sev: "bad", numbers: missing });
      }
      if (added.length) {
        flags.push({ kind: "numbers-added", sev: "warn", numbers: added });
      }
      if (!missing.length && !added.length && a.length) {
        flags.push({ kind: "numbers-ok", sev: "ok", count: a.length });
      }

      const leftovers = (tl.text.match(HEBREW_RUN) ?? [])
        .map((s) => s.trim())
        .filter((s) => /[א-ת]{2,}/.test(s));
      if (leftovers.length) {
        flags.push({
          kind: "hebrew-left",
          sev: "warn",
          sample: [...new Set(leftovers)].slice(0, 3).join(" · "),
        });
      }

      const srcHe = normalizeHebrew(src);
      const tlNorm = normalizeForMatch(tl.text);
      for (const entry of glossary) {
        if (entry.lang !== tl.lang) continue;
        const term = normalizeHebrew(entry.source);
        if (!term || !srcHe.includes(term)) continue;
        if (tlNorm.includes(normalizeForMatch(entry.rendering))) continue;
        flags.push({
          kind: "glossary",
          sev: "warn",
          source: entry.source,
          rendering: entry.rendering,
        });
      }

      for (const term of tl.terms)
        flags.push({ kind: "term", sev: "warn", term });
      for (const d of tl.doubts)
        if (d) flags.push({ kind: "doubt", sev: "warn", text: d });
    }

    if (tr.startsMid) flags.push({ kind: "cut-start", sev: "info" });
    if (tr.endsMid) flags.push({ kind: "cut-end", sev: "info" });
  }

  // De-duplicate by key (e.g. the same term listed twice).
  const out = new Map<string, KeyedFlag>();
  for (const f of flags) {
    const key = flagKey(f);
    if (!out.has(key)) out.set(key, { ...f, key });
  }
  return [...out.values()];
}

export function isOpen(page: Page, flag: KeyedFlag): boolean {
  return (
    (flag.sev === "bad" || flag.sev === "warn") && !page.resolved[flag.key]
  );
}

/** The page's status, from its data (the running step wins when given). */
export function pageStatus(
  page: Page,
  flags: readonly KeyedFlag[],
  running?: "reading" | "translating",
): PageStatus {
  if (running) return running;
  if (page.error) return "error";
  if (!page.transcription) return "idle";
  if (!page.translation) return "read";
  if (page.reviewed) return "reviewed";
  return flags.some((f) => isOpen(page, f)) ? "check" : "done";
}

// ---------------------------------------------------------------------------
// Editing the translation from a flag

export type EditAction = "replace" | "add" | "remove" | "keep";
export type AddPosition = "after" | "before" | "end" | "note";

export function occurrences(text: string, passage: string): number {
  return passage ? text.split(passage).length - 1 : 0;
}

/** Applies a reviewer's edit to the translation text. */
export function editText(
  text: string,
  action: Exclude<EditAction, "keep">,
  passage: string,
  newText: string,
  position: AddPosition | null,
  all: boolean,
  notePrefix: string,
): string {
  if (
    action === "add" &&
    (position === "end" || position === "note" || !passage)
  ) {
    return (
      text.replace(/\s+$/, "") +
      "\n\n" +
      (position === "note" ? notePrefix : "") +
      newText
    );
  }
  const replacement =
    action === "replace"
      ? newText
      : action === "remove"
        ? ""
        : position === "before"
          ? `${newText} ${passage}`
          : `${passage} ${newText}`;
  let out: string;
  if (all) {
    out = text.split(passage).join(replacement);
  } else {
    const i = text.indexOf(passage);
    out =
      i < 0
        ? text
        : text.slice(0, i) + replacement + text.slice(i + passage.length);
  }
  if (action === "remove") {
    out = out
      .replace(/[ \t]{2,}/g, " ")
      .replace(/ +([,.)])/g, "$1")
      .replace(/,\s*([.;])/g, "$1")
      .replace(/\( +/g, "(")
      .replace(/\n[ \t]+/g, "\n");
  }
  return out;
}

/** The passage a flag most likely refers to, to pre-fill the editor. */
export function defaultPassage(flag: Flag): string {
  switch (flag.kind) {
    case "term":
      return flag.term.rendering;
    case "id-invalid":
      return flag.number;
    case "numbers-added":
      return flag.numbers[0] ?? "";
    case "hebrew-left":
      return flag.sample.split(" · ")[0] ?? "";
    default:
      return "";
  }
}
