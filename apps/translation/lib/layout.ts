/**
 * The page's layout, shared by the on-screen preview and the Word export: the
 * translation is laid out like the original, block by block. Claude
 * translates one paragraph per transcription block, in order, so the n-th
 * paragraph of the translation takes the n-th block's type (title, table,
 * stamp…). When the counts no longer match (the reviewer split or merged
 * paragraphs), each paragraph's type is guessed from its own text.
 */

import type { Block, BlockType, Page } from "./model";

export function paragraphsOf(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Table rows → cells (`a | b | c`, as transcribed and translated). */
export function tableRows(text: string): string[][] {
  return text
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => line.split("|").map((cell) => cell.trim()));
}

export function looksLikeTable(text: string): boolean {
  const lines = text.split("\n").filter((l) => l.trim());
  return lines.length > 1 && lines.every((l) => l.includes("|"));
}

function guessType(text: string): BlockType {
  if (/^\[(signature|signé|signed)/i.test(text)) return "signature";
  if (/^\[(cachet|tampon|sceau|stamp|seal)/i.test(text)) return "stamp";
  if (looksLikeTable(text)) return "table";
  return "paragraph";
}

/** The translation, cut into blocks typed like the original's. */
export function translationBlocks(page: Page): Block[] {
  const parts = paragraphsOf(page.translation?.text ?? "");
  const source = page.transcription?.blocks ?? [];
  const aligned = parts.length === source.length;
  return parts.map((text, i) => ({
    type: aligned ? (source[i]?.type ?? "paragraph") : guessType(text),
    text,
  }));
}
