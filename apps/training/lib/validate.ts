/**
 * Server-side input validation for the actions. Each helper returns the
 * cleaned value or throws `InvalidInputError` — never trust what the client sent.
 */

import {
  LIMITS,
  RESULT_STATUSES,
  SOURCE_KEYS,
  type QuestionInput,
  type ResultStatus,
  type Sources,
} from "./exam-logic";
import {
  ISO_DATE,
  masekhetOf,
  STUDY_LIMITS,
  SUBJECTS,
  type LexiconInput,
  type NoteInput,
  type RichDoc,
  type StudyPlan,
  type StudyPlanInput,
  type Subject,
} from "./study-logic";

export class InvalidInputError extends Error {
  constructor(field: string) {
    super(`invalid-${field}`);
    this.name = "InvalidInputError";
  }
}

function text(value: unknown, field: string, max: number): string {
  if (typeof value !== "string") throw new InvalidInputError(field);
  const trimmed = value.trim();
  if (trimmed.length > max) throw new InvalidInputError(field);
  return trimmed;
}

/** Trimmed text, or `null` when empty / absent. */
function optionalText(value: unknown, field: string): string | null {
  if (value === null || value === undefined) return null;
  return text(value, field, LIMITS.text) || null;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID.test(value);
}

export function id(value: unknown, field = "id"): string {
  if (!isUuid(value)) {
    throw new InvalidInputError(field);
  }
  return value;
}

export function ids(value: unknown, max: number): string[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > max) {
    throw new InvalidInputError("ids");
  }
  return [...new Set(value.map((v) => id(v)))];
}

export function int(value: unknown, field: string, min: number, max: number) {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new InvalidInputError(field);
  }
  if (value < min || value > max) throw new InvalidInputError(field);
  return value;
}

export function resultStatus(value: unknown): ResultStatus | null {
  if (value === null) return null;
  if (!(RESULT_STATUSES as readonly unknown[]).includes(value)) {
    throw new InvalidInputError("status");
  }
  return value as ResultStatus;
}

function sources(value: unknown): Sources {
  if (typeof value !== "object" || value === null) {
    throw new InvalidInputError("sources");
  }
  const record = value as Record<string, unknown>;
  return Object.fromEntries(
    SOURCE_KEYS.map((key) => [key, text(record[key] ?? "", key, LIMITS.short)]),
  ) as Sources;
}

export function questionInput(value: unknown): QuestionInput {
  if (typeof value !== "object" || value === null) {
    throw new InvalidInputError("question");
  }
  const input = value as Record<string, unknown>;
  if (!Array.isArray(input.prompts) || input.prompts.length > LIMITS.prompts) {
    throw new InvalidInputError("prompts");
  }
  const rawSources = input.promptSources ?? [];
  if (!Array.isArray(rawSources)) throw new InvalidInputError("promptSources");
  // Empty prompts are dropped together with their sources.
  const kept = input.prompts
    .map((p, i) => ({
      prompt: text(p, "prompt", LIMITS.text),
      sources: sources(rawSources[i] ?? {}),
    }))
    .filter((p) => p.prompt);
  if (kept.length === 0) throw new InvalidInputError("prompts");
  if (typeof input.isSpecial !== "boolean") {
    throw new InvalidInputError("isSpecial");
  }
  return {
    cas: optionalText(input.cas, "cas"),
    prompts: kept.map((p) => p.prompt),
    promptSources: kept.map((p) => p.sources),
    answer: optionalText(input.answer, "answer"),
    siman: text(input.siman ?? "", "siman", LIMITS.short),
    seif: text(input.seif ?? "", "seif", LIMITS.short),
    sources: sources(input.sources),
    isSpecial: input.isSpecial,
  };
}

// ---------------------------------------------------------------------------
// Study

export function isoDay(value: unknown, field = "date"): string {
  if (typeof value !== "string" || !ISO_DATE.test(value)) {
    throw new InvalidInputError(field);
  }
  if (Number.isNaN(Date.parse(`${value}T00:00:00Z`))) {
    throw new InvalidInputError(field);
  }
  return value;
}

function subject(value: unknown): Subject {
  if (!(SUBJECTS as readonly unknown[]).includes(value)) {
    throw new InvalidInputError("subject");
  }
  return value as Subject;
}

/** A book + amud range inside it. */
function passage(input: Record<string, unknown>) {
  if (typeof input.book !== "string") throw new InvalidInputError("book");
  const m = masekhetOf(input.book);
  if (!m) throw new InvalidInputError("book");
  const startAmud = int(input.startAmud, "startAmud", m.first, m.last);
  const endAmud = int(input.endAmud, "endAmud", startAmud, m.last);
  return { subject: subject(input.subject), book: m.key, startAmud, endAmud };
}

function weekdays(value: unknown): number[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > 7) {
    throw new InvalidInputError("weekdays");
  }
  return [...new Set(value.map((d) => int(d, "weekdays", 0, 6)))].sort();
}

export function rhythmInput(
  value: unknown,
): Pick<StudyPlan, "pace" | "weekdays" | "endDate"> {
  if (typeof value !== "object" || value === null) {
    throw new InvalidInputError("rhythm");
  }
  const input = value as Record<string, unknown>;
  return {
    pace:
      input.pace === null
        ? null
        : int(input.pace, "pace", 1, STUDY_LIMITS.pace),
    weekdays: weekdays(input.weekdays),
    endDate: isoDay(input.endDate, "endDate"),
  };
}

export function planInput(value: unknown): StudyPlanInput {
  if (typeof value !== "object" || value === null) {
    throw new InvalidInputError("plan");
  }
  const input = value as Record<string, unknown>;
  const startDate = isoDay(input.startDate, "startDate");
  const rhythm = rhythmInput(input);
  if (rhythm.endDate < startDate) throw new InvalidInputError("endDate");
  return { ...passage(input), ...rhythm, startDate };
}

export function amudList(value: unknown): number[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > 400) {
    throw new InvalidInputError("amudim");
  }
  return [...new Set(value.map((a) => int(a, "amudim", 1, 400)))];
}

/** Attribute values TipTap writes (colours, sizes, alignment) — no CSS injection. */
const SAFE_ATTR = /^(?!.*url)[\w#.%\s,()-]*$/i;

function richDoc(value: unknown): RichDoc {
  if (typeof value !== "object" || value === null) {
    throw new InvalidInputError("content");
  }
  const doc = value as RichDoc;
  if (doc.type !== "doc") throw new InvalidInputError("content");
  if (JSON.stringify(doc).length > STUDY_LIMITS.noteJson) {
    throw new InvalidInputError("content");
  }
  const check = (node: unknown, inAttrs: boolean): void => {
    if (typeof node === "string") {
      if (inAttrs && !SAFE_ATTR.test(node)) {
        throw new InvalidInputError("content");
      }
    } else if (Array.isArray(node)) {
      node.forEach((n) => check(n, inAttrs));
    } else if (typeof node === "object" && node !== null) {
      for (const [key, v] of Object.entries(node)) {
        check(v, inAttrs || key === "attrs");
      }
    }
  };
  check(doc, false);
  return doc;
}

export function noteInput(value: unknown): NoteInput {
  if (typeof value !== "object" || value === null) {
    throw new InvalidInputError("note");
  }
  const input = value as Record<string, unknown>;
  return {
    ...passage(input),
    planId: input.planId === null ? null : id(input.planId, "planId"),
    title: text(input.title ?? "", "title", STUDY_LIMITS.title),
    content: richDoc(input.content),
    text: text(input.text ?? "", "text", STUDY_LIMITS.noteText),
  };
}

export function lexiconInput(value: unknown): LexiconInput {
  if (typeof value !== "object" || value === null) {
    throw new InvalidInputError("lexicon");
  }
  const input = value as Record<string, unknown>;
  if (typeof input.book !== "string") throw new InvalidInputError("book");
  const m = masekhetOf(input.book);
  if (!m) throw new InvalidInputError("book");
  const term = text(input.term, "term", STUDY_LIMITS.term);
  const translation = text(
    input.translation,
    "translation",
    STUDY_LIMITS.translation,
  );
  if (!term || !translation) throw new InvalidInputError("term");
  return {
    book: m.key,
    amud: int(input.amud, "amud", m.first, m.last),
    term,
    translation,
    note: text(input.note ?? "", "note", STUDY_LIMITS.translation),
    isAbbreviation: input.isAbbreviation === true,
  };
}
