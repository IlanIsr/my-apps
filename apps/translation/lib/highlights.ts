/**
 * Where a review flag sits in a text — so the workbench can highlight it
 * right on the document (the Hebrew original or the translation) instead of
 * only listing it. Pure string matching, client-safe: a flag that names no
 * passage (a reading note, a doubt, a page break) has no range.
 */

import type { KeyedFlag, Severity } from "./checks";

/** `source` = the Hebrew transcription, `target` = the translation. */
export type Side = "source" | "target";
export type Range = { start: number; end: number };
export type Mark = Range & { key: string; sev: Severity; n: number };
export type Segment = { text: string; mark: Mark | null; first: boolean };

function indexesOf(text: string, needle: string): Range[] {
  const out: Range[] = [];
  if (!needle.trim()) return out;
  for (let i = text.indexOf(needle); i >= 0; i = text.indexOf(needle, i + 1))
    out.push({ start: i, end: i + needle.length });
  return out;
}

/** Digit runs equal to one of `numbers` (leading zeros ignored, as in the
 * number check). */
function numberRanges(text: string, numbers: readonly string[]): Range[] {
  const wanted = new Set(numbers);
  const out: Range[] = [];
  for (const m of text.matchAll(/\d+/g)) {
    if (wanted.has(m[0].replace(/^0+(?=\d)/, "")))
      out.push({ start: m.index, end: m.index + m[0].length });
  }
  return out;
}

const ILLEGIBLE = /\[(illisible|illegible|לא קריא)[^\]\n]*\]?/gi;

export function flagRanges(flag: KeyedFlag, text: string, side: Side): Range[] {
  switch (flag.kind) {
    case "term":
      return indexesOf(
        text,
        side === "target" ? flag.term.rendering : flag.term.source,
      );
    case "glossary":
      return side === "source" ? indexesOf(text, flag.source) : [];
    case "hebrew-left":
      return side === "target"
        ? flag.sample.split(" · ").flatMap((s) => indexesOf(text, s.trim()))
        : [];
    case "numbers-added":
      return side === "target" ? numberRanges(text, flag.numbers) : [];
    case "numbers-missing":
      return side === "source" ? numberRanges(text, flag.numbers) : [];
    case "id-invalid":
      return numberRanges(text, [flag.number]);
    case "illegible":
      return [...text.matchAll(ILLEGIBLE)].map((m) => ({
        start: m.index,
        end: m.index + m[0].length,
      }));
    default:
      return [];
  }
}

/** The marks of `flags` in `text`, sorted, without overlaps (the earlier,
 * then the longer, wins). */
export function marksIn(
  text: string,
  flags: readonly { flag: KeyedFlag; n: number }[],
  side: Side,
): Mark[] {
  const all = flags.flatMap(({ flag, n }) =>
    flagRanges(flag, text, side).map((r) => ({
      ...r,
      key: flag.key,
      sev: flag.sev,
      n,
    })),
  );
  all.sort((a, b) => a.start - b.start || b.end - a.end);
  const out: Mark[] = [];
  let end = -1;
  for (const m of all) {
    if (m.start < end) continue;
    out.push(m);
    end = m.end;
  }
  return out;
}

/** `text` cut at the marks; `first` = the first mark of its flag in it. */
export function segmentsOf(text: string, marks: readonly Mark[]): Segment[] {
  const out: Segment[] = [];
  const seen = new Set<string>();
  let at = 0;
  for (const m of marks) {
    if (m.start > at)
      out.push({ text: text.slice(at, m.start), mark: null, first: false });
    out.push({
      text: text.slice(m.start, m.end),
      mark: m,
      first: !seen.has(m.key),
    });
    seen.add(m.key);
    at = m.end;
  }
  if (at < text.length)
    out.push({ text: text.slice(at), mark: null, first: false });
  return out;
}
