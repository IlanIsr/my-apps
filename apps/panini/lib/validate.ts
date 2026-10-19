/**
 * Server-side input validation for the album actions. Each helper returns the
 * cleaned value or throws `InvalidInputError` — never trust what the client sent.
 */

import {
  COLLECTOR_COLORS,
  LIMITS,
  type ImportEntry,
  type PageReward,
} from "./album-logic";

export class InvalidInputError extends Error {
  constructor(field: string) {
    super(`invalid-${field}`);
    this.name = "InvalidInputError";
  }
}

export function text(
  value: unknown,
  field: string,
  max: number,
  { required = true } = {},
): string {
  if (typeof value !== "string") throw new InvalidInputError(field);
  const trimmed = value.trim();
  if ((required && !trimmed) || trimmed.length > max) {
    throw new InvalidInputError(field);
  }
  return trimmed;
}

export function int(
  value: unknown,
  field: string,
  min: number,
  max: number,
): number {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new InvalidInputError(field);
  }
  if (value < min || value > max) throw new InvalidInputError(field);
  return value;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function id(value: unknown, field = "id"): string {
  if (typeof value !== "string" || !UUID.test(value)) {
    throw new InvalidInputError(field);
  }
  return value;
}

export function color(value: unknown): string {
  if (!(COLLECTOR_COLORS as readonly unknown[]).includes(value)) {
    throw new InvalidInputError("color");
  }
  return value as string;
}

export function cardEntry(value: unknown): ImportEntry {
  const v = (value ?? {}) as Record<string, unknown>;
  return {
    code: text(v.code, "code", LIMITS.code),
    page: int(v.page, "page", 1, LIMITS.page),
    label: text(v.label ?? "", "label", LIMITS.label, { required: false }),
  };
}

export function reward(value: unknown): PageReward {
  const v = (value ?? {}) as Record<string, unknown>;
  const page = int(v.page, "page", 1, LIMITS.page);
  const prize = text(v.prize, "prize", LIMITS.prize);
  if (v.kind === "deadline") {
    if (
      typeof v.deadline !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(v.deadline) ||
      Number.isNaN(Date.parse(v.deadline))
    ) {
      throw new InvalidInputError("deadline");
    }
    return {
      page,
      prize,
      kind: "deadline",
      deadline: v.deadline,
      winners: null,
    };
  }
  if (v.kind === "first_n") {
    const winners = int(v.winners, "winners", 1, LIMITS.winners);
    return { page, prize, kind: "first_n", deadline: null, winners };
  }
  throw new InvalidInputError("kind");
}
