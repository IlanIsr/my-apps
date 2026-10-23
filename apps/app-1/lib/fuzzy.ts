/**
 * Tiny fuzzy matcher for short lists (no library). Case-, accent- and
 * niqqud-insensitive; every query word must match some word of the text —
 * by substring, or within one typo for words of 4+ letters.
 */

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f\u0591-\u05c7]/g, "") // Latin accents, Hebrew niqqud
    .toLowerCase();
}

function words(s: string): string[] {
  return normalize(s)
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

/** Levenshtein distance ≤ 1 (one insertion, deletion or substitution). */
function withinOneEdit(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else {
      i++;
      j++;
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

export function fuzzyMatch(query: string, text: string): boolean {
  const q = words(query);
  if (q.length === 0) return true;
  const t = words(text);
  return q.every((qw) =>
    t.some(
      (tw) =>
        tw.includes(qw) ||
        // One typo against the whole word or the start of it (still typing).
        (qw.length >= 4 &&
          [tw, tw.slice(0, qw.length), tw.slice(0, qw.length + 1)].some((w) =>
            withinOneEdit(qw, w),
          )),
    ),
  );
}
