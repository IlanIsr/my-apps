/**
 * Sournois' rules, pure and deterministic (no randomness, no clock — the
 * daily opening takes its date as an argument). Client-safe.
 *
 * No secret word: the game keeps the set of candidates still consistent with
 * every answer it gave, and after each guess keeps the largest group of
 * candidates sharing one colour pattern.
 */

/** Version of the word lists in `public/dict/` (scores are per version). */
export const DICT_VERSION = "v1";
export const MIN_LENGTH = 4;
export const MAX_LENGTH = 10;
/** A length is offered only with at least this many answers. */
export const MIN_ANSWERS = 300;
/** The lengths `scripts/build-dictionary.ts` wrote a list for. */
export const LENGTHS = [4, 5, 6, 7, 8, 9, 10] as const;

/** 0 = grey (absent), 1 = yellow (elsewhere), 2 = green (right place). */
export type Mark = 0 | 1 | 2;

export type Turn = { guess: string; marks: Mark[] };

export type Dictionary = {
  length: number;
  /** Possible answers, sorted. */
  answers: string[];
  /** Every accepted guess (answers included). */
  accepted: Set<string>;
};

/** Upper case, no accents, Œ → OE, Æ → AE. */
export function normalize(word: string): string {
  return word
    .trim()
    .toLowerCase()
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toUpperCase();
}

/** The colours `guess` gets if the answer is `word` (same length). */
export function score(guess: string, word: string): Mark[] {
  const marks: Mark[] = Array.from({ length: guess.length }, () => 0);
  const left = new Map<string, number>();
  for (let i = 0; i < word.length; i++) {
    if (guess[i] === word[i]) marks[i] = 2;
    else left.set(word[i]!, (left.get(word[i]!) ?? 0) + 1);
  }
  for (let i = 0; i < guess.length; i++) {
    if (marks[i] === 2) continue;
    const n = left.get(guess[i]!) ?? 0;
    if (n > 0) {
      marks[i] = 1;
      left.set(guess[i]!, n - 1);
    }
  }
  return marks;
}

const count = (marks: Mark[], mark: Mark) =>
  marks.filter((m) => m === mark).length;

/** Is pattern `a` preferred to `b` among groups of the same size? */
function before(a: Mark[], b: Mark[]): boolean {
  const greens = count(a, 2) - count(b, 2);
  if (greens !== 0) return greens < 0;
  const yellows = count(a, 1) - count(b, 1);
  if (yellows !== 0) return yellows < 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return a[i]! < b[i]!;
  }
  return false;
}

/**
 * The opponent's answer to `guess`: the largest group of candidates sharing
 * one pattern (ties: fewest greens, then fewest yellows, then the first
 * pattern reading left to right with grey < yellow < green).
 */
export function respond(
  candidates: string[],
  guess: string,
): { marks: Mark[]; candidates: string[] } {
  const groups = new Map<string, { marks: Mark[]; words: string[] }>();
  for (const word of candidates) {
    const marks = score(guess, word);
    const key = marks.join("");
    const group = groups.get(key);
    if (group) group.words.push(word);
    else groups.set(key, { marks, words: [word] });
  }
  let best: { marks: Mark[]; words: string[] } | null = null;
  for (const group of groups.values()) {
    if (
      !best ||
      group.words.length > best.words.length ||
      (group.words.length === best.words.length &&
        before(group.marks, best.marks))
    ) {
      best = group;
    }
  }
  return { marks: best!.marks, candidates: best!.words };
}

export const isWin = (marks: Mark[]) => marks.every((m) => m === 2);

/**
 * Hard mode: why `guess` can't be the answer given the earlier turns — the
 * first turn it contradicts — or null when it fits them all.
 */
export function contradiction(
  guess: string,
  turns: Turn[],
): { turn: Turn; position: number; kind: "green" | "yellow" | "other" } | null {
  for (const turn of turns) {
    const marks = score(turn.guess, guess);
    const i = marks.findIndex((m, j) => m !== turn.marks[j]);
    if (i === -1) continue;
    const kind =
      turn.marks[i] === 2
        ? "green"
        : turn.marks[i] === 1 && guess[i] === turn.guess[i]
          ? "yellow"
          : "other";
    return { turn, position: i, kind };
  }
  return null;
}

export type Refusal =
  | { reason: "length" }
  | { reason: "unknown" }
  | { reason: "opening"; word: string }
  | { reason: "hard"; detail: NonNullable<ReturnType<typeof contradiction>> };

/** Why a guess is refused, or null when it's valid (it then counts). */
export function refusal(
  guess: string,
  dict: Dictionary,
  turns: Turn[],
  options: { hard: boolean; opening: string | null },
): Refusal | null {
  if (guess.length !== dict.length) return { reason: "length" };
  if (!dict.accepted.has(guess)) return { reason: "unknown" };
  if (options.opening && turns.length === 0 && guess !== options.opening) {
    return { reason: "opening", word: options.opening };
  }
  if (options.hard) {
    const detail = contradiction(guess, turns);
    if (detail) return { reason: "hard", detail };
  }
  return null;
}

/** Replays a list of (valid) guesses from the start. */
export function replay(
  dict: Dictionary,
  guesses: string[],
): { turns: Turn[]; candidates: string[] } {
  let candidates = dict.answers;
  const turns: Turn[] = [];
  for (const guess of guesses) {
    const answer = respond(candidates, guess);
    candidates = answer.candidates;
    turns.push({ guess, marks: answer.marks });
  }
  return { turns, candidates };
}

/**
 * The "ouverture du jour": a first guess imposed on everyone for `day`
 * (YYYY-MM-DD) and length, drawn from the answers by a fixed hash — the same
 * for every player, so their scores compare.
 */
export function dailyOpening(answers: string[], day: string): string {
  let h = 2166136261;
  for (const c of `${DICT_VERSION}|${day}|${answers.length}`) {
    h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  }
  return answers[h % answers.length]!;
}

/** Best colour seen for each letter (for the keyboard). */
export function letterMarks(turns: Turn[]): Map<string, Mark> {
  const best = new Map<string, Mark>();
  for (const { guess, marks } of turns) {
    marks.forEach((mark, i) => {
      const letter = guess[i]!;
      if ((best.get(letter) ?? -1) < mark) best.set(letter, mark);
    });
  }
  return best;
}
