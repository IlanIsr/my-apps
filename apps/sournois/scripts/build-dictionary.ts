/**
 * Builds the word lists in `public/dict/<version>/<N>.json` from Lexique 3.83
 * (http://www.lexique.org, New & Pallier — CC BY-SA 4.0; the lists it writes
 * are under the same licence, see `public/dict/LICENCE.txt`).
 *
 *   node scripts/build-dictionary.ts /path/to/Lexique383.tsv
 *
 * - accepted guesses = every written form of N letters after normalization
 *   (`normalize` in lib/game.ts), without spaces / apostrophes / hyphens;
 * - answers = the common ones: a lemma (singular noun, masculine adjective,
 *   infinitive, adverb) seen at least `MIN_FREQ` times per million words
 *   (films + books).
 *
 * Bump `VERSION` (and `DICT_VERSION` in lib/game.ts) whenever the output
 * changes: games are only comparable on the same lists.
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { MAX_LENGTH, MIN_ANSWERS, MIN_LENGTH, normalize } from "../lib/game.ts";

const VERSION = "v1";
const MIN_FREQ = 2;
const ANSWER_CLASSES = new Set(["NOM", "ADJ", "VER", "ADV"]);

const source = process.argv[2];
if (!source) throw new Error("Usage: build-dictionary.ts <Lexique383.tsv>");

const [header, ...rows] = readFileSync(source, "utf8").trim().split("\n");
const col = (name: string) => header!.split("\t").indexOf(name);
const [ORTHO, CGRAM, ISLEM, FILMS, BOOKS] = [
  col("ortho"),
  col("cgram"),
  col("islem"),
  col("freqfilms2"),
  col("freqlivres"),
];

const accepted = new Map<number, Set<string>>();
const answers = new Map<number, Set<string>>();
for (const row of rows) {
  const cells = row.split("\t");
  const written = cells[ORTHO]!;
  if (/[\s'’-]/.test(written)) continue;
  const word = normalize(written);
  if (!/^[A-Z]+$/.test(word)) continue;
  const n = word.length;
  if (n < MIN_LENGTH || n > MAX_LENGTH) continue;
  if (!accepted.has(n)) accepted.set(n, new Set());
  accepted.get(n)!.add(word);
  const freq = Number(cells[FILMS] || 0) + Number(cells[BOOKS] || 0);
  if (
    cells[ISLEM] === "1" &&
    ANSWER_CLASSES.has(cells[CGRAM]!) &&
    freq >= MIN_FREQ
  ) {
    if (!answers.has(n)) answers.set(n, new Set());
    answers.get(n)!.add(word);
  }
}

const out = join(
  dirname(fileURLToPath(import.meta.url)),
  "../public/dict",
  VERSION,
);
mkdirSync(out, { recursive: true });
for (let n = MIN_LENGTH; n <= MAX_LENGTH; n++) {
  const a = [...(answers.get(n) ?? [])].sort();
  if (a.length < MIN_ANSWERS) continue;
  const answerSet = new Set(a);
  // Stored without the answers (the game adds them back).
  const extra = [...accepted.get(n)!].filter((w) => !answerSet.has(w)).sort();
  writeFileSync(
    join(out, `${n}.json`),
    JSON.stringify({ answers: a, extra }) + "\n",
  );
  console.log(
    `${n} letters: ${a.length} answers, ${a.length + extra.length} accepted`,
  );
}
