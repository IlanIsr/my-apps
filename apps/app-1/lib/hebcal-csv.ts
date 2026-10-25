/**
 * Parses a Hebcal "Yahrzeit + Anniversary" CSV export (Outlook format: one row
 * per occurrence) into one import entry per person. Client-safe, no I/O.
 *
 * A row's Subject carries everything we need —
 * `"Name’s 29th Yahrzeit (3rd of Adar II)"` — and its Description ends with the
 * occurrence's Hebrew year (`…; 5787.`), from which the original Hebrew year is
 * `year - 29`. "Start Date" may be `dd/mm/yyyy` or `mm/dd/yyyy`; the file's
 * format is detected (a part > 12, else whichever matches the Hebrew dates) and
 * only used when a Subject has no Hebrew date.
 */

import {
  gregorianToHebrew,
  HEBREW_MONTH_KEYS,
  hebrewYearForGregorian,
  monthKeyForYear,
  type HebrewMonthKey,
  type Minhag,
} from "@repo/hebcal";
import type { AnniversaryType } from "@repo/anniversaries/person";

export type CsvAnniversary = {
  name: string;
  type: AnniversaryType;
  /** The Hebcal kind as written ("Yahrzeit", "Hebrew Birthday", …). */
  sourceKind: string;
  hebDay: number;
  hebMonth: HebrewMonthKey;
  /** Hebrew year of birth / passing, when the file gives it. */
  hebYear?: number;
  minhag: Minhag;
  /** Rows of the file for this person. */
  rows: number;
};

export type CsvParseResult = {
  anniversaries: CsvAnniversary[];
  /** Data rows that couldn't be understood. */
  skipped: number;
  dateFormat: "dmy" | "mdy";
};

/** RFC 4180-ish: quoted fields, `""` escapes, commas / newlines in quotes. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((f) => f.trim()));
}

const MONTH_ALIASES: Record<string, HebrewMonthKey> = {
  tishrei: "Tishrei",
  tishri: "Tishrei",
  cheshvan: "Cheshvan",
  heshvan: "Cheshvan",
  marcheshvan: "Cheshvan",
  kislev: "Kislev",
  tevet: "Tevet",
  teves: "Tevet",
  shvat: "Shvat",
  "sh'vat": "Shvat",
  shevat: "Shvat",
  adar: "Adar",
  "adar i": "Adar1",
  "adar 1": "Adar1",
  "adar ii": "Adar2",
  "adar 2": "Adar2",
  nisan: "Nisan",
  iyyar: "Iyyar",
  iyar: "Iyyar",
  sivan: "Sivan",
  tamuz: "Tamuz",
  tammuz: "Tamuz",
  av: "Av",
  elul: "Elul",
};

function monthKey(name: string): HebrewMonthKey | null {
  const key = MONTH_ALIASES[name.trim().toLowerCase().replace(/’/g, "'")];
  return key && HEBREW_MONTH_KEYS.includes(key) ? key : null;
}

/** "Name’s 29th Yahrzeit (3rd of Adar II)" */
const SUBJECT =
  /^(.+?)[’']s\s+(\d+)(?:st|nd|rd|th)\s+(.+?)\s*(?:\((\d+)(?:st|nd|rd|th)\s+of\s+([^)]+)\))?\s*$/i;

function typeOf(kind: string): AnniversaryType {
  return /yahrzeit|yortzeit|azkara/i.test(kind) ? "yahrzeit" : "birthday";
}

type Row = {
  name: string;
  nth: number;
  kind: string;
  hebDay?: number;
  hebMonth?: HebrewMonthKey;
  /** Hebrew year of this occurrence. */
  year?: number;
  date?: [number, number, number];
};

/** Which `a/b/yyyy` reading fits the file. */
function detectFormat(rows: Row[]): "dmy" | "mdy" {
  const dated = rows.filter((r) => r.date);
  if (dated.some((r) => r.date![0] > 12)) return "dmy";
  if (dated.some((r) => r.date![1] > 12)) return "mdy";
  // Ambiguous everywhere: keep the reading whose Hebrew date matches more rows.
  const score = (dmy: boolean) =>
    dated.filter((r) => {
      const [a, b, y] = r.date!;
      const heb = dmy ? gregorianToHebrew(y, b, a) : gregorianToHebrew(y, a, b);
      return heb && heb.day === r.hebDay && monthKey(heb.month) === r.hebMonth;
    }).length;
  return score(false) > score(true) ? "mdy" : "dmy";
}

export function parseHebcalCsv(text: string): CsvParseResult {
  const [header, ...data] = parseCsv(text.replace(/^\uFEFF/, ""));
  const col = (name: string) =>
    (header ?? []).findIndex((h) => h.trim().toLowerCase() === name);
  const iSubject = col("subject");
  const iDate = col("start date");
  const iDescription = col("description");
  if (iSubject < 0)
    return { anniversaries: [], skipped: data.length, dateFormat: "dmy" };

  let skipped = 0;
  const rows: Row[] = [];
  for (const r of data) {
    const m = SUBJECT.exec((r[iSubject] ?? "").trim());
    if (!m) {
      skipped++;
      continue;
    }
    const [, name = "", nth = "", kind = "", day, month] = m;
    const date = (r[iDate] ?? "")
      .trim()
      .match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    const year = (r[iDescription] ?? "").match(/(\d{4})\.\s*(?:\\n|\n|$)/);
    rows.push({
      name: name.trim(),
      nth: Number(nth),
      kind: kind.trim(),
      hebDay: day ? Number(day) : undefined,
      hebMonth: (month && monthKey(month)) || undefined,
      year: year ? Number(year[1]) : undefined,
      date: date
        ? [Number(date[1]), Number(date[2]), Number(date[3])]
        : undefined,
    });
  }

  const dateFormat = detectFormat(rows);
  // Rows without a Hebrew date in the Subject: read it off the Gregorian date.
  for (const row of rows) {
    if ((row.hebDay && row.hebMonth) || !row.date) continue;
    const [a, b, y] = row.date;
    // The file's format, unless this row can only be read the other way.
    const dmy = b > 12 ? false : a > 12 ? true : dateFormat === "dmy";
    const [d, mo] = dmy ? [a, b] : [b, a];
    const heb = gregorianToHebrew(y, mo, d);
    if (!heb) continue;
    row.hebDay = heb.day;
    row.hebMonth = monthKey(heb.month) ?? undefined;
    row.year ??= hebrewYearForGregorian(y, mo, d);
  }

  const groups = new Map<string, Row[]>();
  for (const row of rows) {
    if (!row.hebDay || !row.hebMonth) {
      skipped++;
      continue;
    }
    const key = `${row.name.toLowerCase()}|${typeOf(row.kind)}`;
    groups.set(key, [...(groups.get(key) ?? []), row]);
  }

  const anniversaries: CsvAnniversary[] = [];
  for (const group of groups.values()) {
    const first = group[0]!;
    const bases = group.flatMap((r) => (r.year ? [r.year - r.nth] : []));
    const hebYear = bases[0];
    const months = new Set(group.map((r) => r.hebMonth));
    const adar = [...months].every((m) => m?.startsWith("Adar"));

    // Adar moves between leap and regular years; any other month is fixed.
    let hebMonth: HebrewMonthKey = first.hebMonth!;
    let minhag: Minhag = "sephardi";
    if (adar) {
      const inLeap = group.find((r) => r.hebMonth !== "Adar")?.hebMonth;
      if (inLeap === "Adar1") minhag = "ashkenazi";
      const baseLeap =
        !!hebYear && monthKeyForYear("Adar", hebYear) === "Adar1";
      hebMonth = baseLeap ? (inLeap ?? "Adar2") : "Adar";
    }

    anniversaries.push({
      name: first.name,
      type: typeOf(first.kind),
      sourceKind: first.kind,
      hebDay: first.hebDay!,
      hebMonth,
      hebYear: hebYear && hebYear > 0 ? hebYear : undefined,
      minhag,
      rows: group.length,
    });
  }

  return { anniversaries, skipped, dateFormat };
}
