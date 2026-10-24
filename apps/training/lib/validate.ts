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
  const prompts = input.prompts
    .map((p) => text(p, "prompt", LIMITS.text))
    .filter(Boolean);
  if (prompts.length === 0) throw new InvalidInputError("prompts");
  if (typeof input.isSpecial !== "boolean") {
    throw new InvalidInputError("isSpecial");
  }
  return {
    cas: optionalText(input.cas, "cas"),
    prompts,
    answer: optionalText(input.answer, "answer"),
    siman: text(input.siman ?? "", "siman", LIMITS.short),
    seif: text(input.seif ?? "", "seif", LIMITS.short),
    sources: sources(input.sources),
    isSpecial: input.isSpecial,
  };
}
