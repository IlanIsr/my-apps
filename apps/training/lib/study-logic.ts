/**
 * Client-safe types + pure helpers for study plans ("cursus") and notes
 * ("fiches"). No DB, no server-only imports.
 *
 * The unit is the **amud**, numbered like Sefaria's sections: 1 = 1a, 2 = 1b,
 * 3 = 2a, … A plan covers a range of amudim of one masekhet, studied on chosen
 * weekdays until an end date. The programme is never stored: it's recomputed
 * from the plan + what was studied, so falling behind spreads what's left over
 * the remaining days ("catch up") until the user moves the end date.
 *
 * Dates are local calendar days, `"YYYY-MM-DD"`; date maths runs in UTC on
 * those strings, so it never drifts with the time zone.
 */

import { SHASS } from "./shass";

export const SEDARIM = [
  "zeraim",
  "moed",
  "nashim",
  "nezikin",
  "kodashim",
  "tahorot",
] as const;

export type SederKey = (typeof SEDARIM)[number];

export type Perek = { he: string; start: number; end: number };

export type Masekhet = {
  /** Sefaria's title, e.g. `"Bava Kamma"` — also the stored book key. */
  key: string;
  he: string;
  seder: string;
  /** First / last amud. */
  first: number;
  last: number;
  perakim: readonly Perek[];
};

export function masekhetOf(key: string): Masekhet | undefined {
  return SHASS.find((m) => m.key === key);
}

/** 0-based perek index containing `amud` (the one that starts there, if shared). */
export function perekIndexOf(m: Masekhet, amud: number): number {
  let index = 0;
  m.perakim.forEach((p, i) => {
    if (p.start <= amud) index = i;
  });
  return index;
}

// ---------------------------------------------------------------------------
// Amud labels

const UNITS = ["", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"];
const TENS = ["", "י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ"];
const HUNDREDS = ["", "ק", "ר", "ש", "ת"];

/** 1..499 in Hebrew numerals (15 = ט״ו, 16 = ט״ז), with geresh / gershayim. */
export function hebrewNumeral(n: number): string {
  let letters = HUNDREDS[Math.floor(n / 100)] ?? "";
  const rest = n % 100;
  if (rest === 15) letters += "טו";
  else if (rest === 16) letters += "טז";
  else letters += (TENS[Math.floor(rest / 10)] ?? "") + UNITS[rest % 10];
  return letters.length === 1
    ? `${letters}׳`
    : `${letters.slice(0, -1)}״${letters.slice(-1)}`;
}

export const dafOf = (amud: number) => Math.ceil(amud / 2);
export const sideOf = (amud: number): "a" | "b" => (amud % 2 ? "a" : "b");

/** `"2a"`, or `"ב ע״א"` in Hebrew. */
export function amudLabel(amud: number, hebrew = false): string {
  const daf = dafOf(amud);
  if (!hebrew) return `${daf}${sideOf(amud)}`;
  return `${hebrewNumeral(daf)} ${sideOf(amud) === "a" ? "ע״א" : "ע״ב"}`;
}

/** `"2a–5b"` (or a single amud). */
export function rangeLabel(start: number, end: number, hebrew = false) {
  return start === end
    ? amudLabel(start, hebrew)
    : `${amudLabel(start, hebrew)}–${amudLabel(end, hebrew)}`;
}

/** Masekhet name for the UI: Hebrew in Hebrew, Sefaria's transliteration otherwise. */
export function masekhetName(key: string, hebrew = false): string {
  const m = masekhetOf(key);
  return m ? (hebrew ? m.he : m.key) : key;
}

export function amudim(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

// ---------------------------------------------------------------------------
// Dates

const DAY = 86_400_000;

const toTime = (iso: string) => Date.parse(`${iso}T00:00:00Z`);
const toIso = (time: number) => new Date(time).toISOString().slice(0, 10);

export function addDays(iso: string, days: number): string {
  return toIso(toTime(iso) + days * DAY);
}

/** 0 = Sunday … 6 = Saturday. */
export const weekdayOf = (iso: string) => new Date(toTime(iso)).getUTCDay();

/** Today in the browser's time zone. */
export function localToday(): string {
  const now = new Date();
  return toIso(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

export const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Study days in [from, to], both included. */
export function studyDays(from: string, to: string, weekdays: number[]) {
  const days: string[] = [];
  for (let t = toTime(from); t <= toTime(to); t += DAY) {
    if (weekdays.includes(new Date(t).getUTCDay())) days.push(toIso(t));
  }
  return days;
}

/** The first study day on or after `from`. */
export function nextStudyDay(from: string, weekdays: number[]): string {
  let day = from;
  while (!weekdays.includes(weekdayOf(day))) day = addDays(day, 1);
  return day;
}

/** The study day on which `count` amudim at `pace` per day, from `from`, end. */
export function endDateForPace(
  from: string,
  weekdays: number[],
  count: number,
  pace: number,
): string {
  let day = nextStudyDay(from, weekdays);
  for (let sessions = Math.ceil(count / pace) - 1; sessions > 0; sessions--) {
    day = nextStudyDay(addDays(day, 1), weekdays);
  }
  return day;
}

// ---------------------------------------------------------------------------
// Plans

export const SUBJECTS = ["gemara"] as const;
export type Subject = (typeof SUBJECTS)[number];

export type StudyPlan = {
  id: string;
  subject: Subject;
  /** Masekhet key. */
  book: string;
  startAmud: number;
  endAmud: number;
  /** Amudim per session when set by pace; `null` when set by end date. */
  pace: number | null;
  weekdays: number[];
  startDate: string;
  endDate: string;
  /** Amud → the day it was studied. */
  studied: Record<string, string>;
  createdAt: string;
};

export type StudyPlanInput = Pick<
  StudyPlan,
  | "subject"
  | "book"
  | "startAmud"
  | "endAmud"
  | "pace"
  | "weekdays"
  | "startDate"
  | "endDate"
>;

export type Session = { date: string; amudim: number[] };

/** `items` cut into `k` consecutive chunks whose sizes differ by at most 1. */
function split<T>(items: T[], k: number): T[][] {
  return Array.from({ length: k }, (_, i) =>
    items.slice(
      Math.round((i * items.length) / k),
      Math.round(((i + 1) * items.length) / k),
    ),
  );
}

/**
 * Spreads `items` over `days`. With a pace, never more than needed per day
 * (ahead → finish early), but as many as needed to end on the last day
 * (behind → catch up). Without one, one per day at least, evenly.
 */
function spread(items: number[], days: string[], pace: number | null) {
  if (items.length === 0 || days.length === 0) return [];
  const byPace = pace ? Math.ceil(items.length / pace) : Infinity;
  const k = Math.min(days.length, items.length, byPace);
  return split(items, k).map((chunk, i) => ({ date: days[i]!, amudim: chunk }));
}

/**
 * The programme from `today` on. Today's session is what was due this
 * morning (incl. what's already been studied today); the days after share
 * what's still left, up to the end date — or all of it on the next study day
 * once the end date has passed.
 */
export function upcoming(plan: StudyPlan, today: string): Session[] {
  const studiedToday = new Set<number>();
  const left: number[] = [];
  for (const a of amudim(plan.startAmud, plan.endAmud)) {
    const day = plan.studied[a];
    if (day === undefined) left.push(a);
    else if (day >= today) studiedToday.add(a);
  }

  const isStudyDay = plan.weekdays.includes(weekdayOf(today));
  const firstDay =
    isStudyDay || studiedToday.size
      ? today
      : nextStudyDay(today, plan.weekdays);
  const days = studyDays(firstDay, plan.endDate, plan.weekdays);
  if (days[0] !== firstDay) days.unshift(firstDay);

  if (firstDay !== today) return spread(left, days, plan.pace);

  // Today's share, as of this morning.
  const morning = [...left, ...studiedToday].sort((a, b) => a - b);
  // Studied on a day off → today is just that, nothing was due.
  const todayShare = isStudyDay
    ? (spread(morning, days, plan.pace)[0]?.amudim ?? [])
    : [];
  const todaySet = new Set([...todayShare, ...studiedToday]);
  const rest = left.filter((a) => !todaySet.has(a));
  const session = {
    date: today,
    amudim: [...todaySet].sort((a, b) => a - b),
  };
  return [
    ...(session.amudim.length ? [session] : []),
    ...spread(rest, days.slice(1), plan.pace),
  ];
}

export type PlanProgress = {
  total: number;
  studied: number;
  /** Amudim behind (> 0) or ahead (< 0) of the original programme, before today. */
  behind: number;
  done: boolean;
};

export function planProgress(plan: StudyPlan, today: string): PlanProgress {
  const all = amudim(plan.startAmud, plan.endAmud);
  const nominal = spread(
    all,
    studyDays(plan.startDate, plan.endDate, plan.weekdays),
    plan.pace,
  );
  const expected = nominal
    .filter((s) => s.date < today)
    .reduce((sum, s) => sum + s.amudim.length, 0);
  const studiedBefore = all.filter((a) => {
    const day = plan.studied[a];
    return day !== undefined && day < today;
  }).length;
  const studied = all.filter((a) => plan.studied[a] !== undefined).length;
  return {
    total: all.length,
    studied,
    behind: expected - studiedBefore,
    done: studied === all.length,
  };
}

/** The pace a plan is meant to keep (its own, or the original average). */
export function nominalPace(plan: StudyPlan): number {
  if (plan.pace) return plan.pace;
  const days = studyDays(plan.startDate, plan.endDate, plan.weekdays).length;
  return Math.max(1, Math.round((plan.endAmud - plan.startAmud + 1) / days));
}

/** "Push back": the end date if what's left goes at the nominal pace from today. */
export function shiftedEndDate(plan: StudyPlan, today: string): string {
  const left = amudim(plan.startAmud, plan.endAmud).filter(
    (a) => plan.studied[a] === undefined || plan.studied[a]! >= today,
  ).length;
  if (left === 0) return plan.endDate;
  return endDateForPace(today, plan.weekdays, left, nominalPace(plan));
}

// ---------------------------------------------------------------------------
// Notes

/** A TipTap document (JSON), stored as is. */
export type RichDoc = { type: "doc"; content?: unknown[] };

export type Note = {
  id: string;
  subject: Subject;
  book: string;
  startAmud: number;
  endAmud: number;
  planId: string | null;
  title: string;
  content: RichDoc;
  /** Plain text of `content`, for search and previews. */
  text: string;
  createdAt: string;
  updatedAt: string;
};

export type NoteInput = Pick<
  Note,
  | "subject"
  | "book"
  | "startAmud"
  | "endAmud"
  | "planId"
  | "title"
  | "content"
  | "text"
>;

export const EMPTY_DOC: RichDoc = { type: "doc", content: [] };

// ---------------------------------------------------------------------------
// Lexicon

/** One term of the user's lexicon, on one amud. */
export type LexiconEntry = {
  id: string;
  book: string;
  amud: number;
  term: string;
  translation: string;
  note: string;
  createdAt: string;
};

export type LexiconInput = Pick<
  LexiconEntry,
  "book" | "amud" | "term" | "translation" | "note"
>;

/** Search over term, translation and note, ignoring niqqud and case. */
export function matchesLexicon(entry: LexiconEntry, query: string): boolean {
  const plain = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0591-\u05C7\u0300-\u036f]/g, "")
      .toLowerCase();
  const q = plain(query.trim());
  return (
    !q ||
    plain(`${entry.term}\n${entry.translation}\n${entry.note}`).includes(q)
  );
}

export const STUDY_LIMITS = {
  term: 200,
  translation: 2000,
  /** Serialized note JSON, in characters. */
  noteJson: 200_000,
  noteText: 50_000,
  title: 200,
  pace: 40,
};
