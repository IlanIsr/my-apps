/**
 * What the browser remembers: the settings, the game in progress (only its
 * guesses — the rest is replayed, the rules being deterministic) and the
 * scores, per length and mode. Every access is guarded: storage can be
 * missing (private window, blocked site data).
 */

import { DICT_VERSION } from "./game";

export type Settings = { length: number; hard: boolean; daily: boolean };

/** A game: its settings, its day (daily opening only) and its guesses. */
export type SavedGame = Settings & {
  version: string;
  day: string | null;
  guesses: string[];
};

export type ScoreLine = { played: number; best: number; total: number };

const KEYS = {
  settings: "sournois.settings",
  game: "sournois.game",
  scores: `sournois.scores.${DICT_VERSION}`,
  daily: `sournois.daily.${DICT_VERSION}`,
};

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Not remembered — the game still works.
  }
}

export const loadSettings = () => read<Settings>(KEYS.settings);
export const saveSettings = (s: Settings) => write(KEYS.settings, s);

export const loadGame = () => {
  const game = read<SavedGame>(KEYS.game);
  return game?.version === DICT_VERSION ? game : null;
};
export const saveGame = (game: SavedGame | null) => write(KEYS.game, game);

/** Scores are compared per length and mode only. */
export const modeKey = (s: Settings) =>
  `${s.length}|${s.hard ? "difficile" : "normal"}|${s.daily ? "jour" : "libre"}`;

export const loadScores = () =>
  read<Record<string, ScoreLine>>(KEYS.scores) ?? {};

/** The day's first finished score, per `day|length|hard`. */
export const loadDaily = () => read<Record<string, number>>(KEYS.daily) ?? {};
export const dailyKey = (day: string, s: Settings) =>
  `${day}|${s.length}|${s.hard ? "difficile" : "normal"}`;

/** Records a won game; returns the line it updated. */
export function recordWin(game: SavedGame): ScoreLine {
  const n = game.guesses.length;
  const scores = loadScores();
  const key = modeKey(game);
  const old = scores[key];
  const line = old
    ? {
        played: old.played + 1,
        best: Math.min(old.best, n),
        total: old.total + n,
      }
    : { played: 1, best: n, total: n };
  write(KEYS.scores, { ...scores, [key]: line });
  if (game.day) {
    const daily = loadDaily();
    const dk = dailyKey(game.day, game);
    if (daily[dk] === undefined) write(KEYS.daily, { ...daily, [dk]: n });
  }
  return line;
}

/** Today in the player's time zone, YYYY-MM-DD. */
export function today(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
