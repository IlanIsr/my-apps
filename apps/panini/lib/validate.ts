/**
 * Server-side input validation for the album actions. Each helper returns the
 * cleaned value or throws `InvalidInputError` — never trust what the client sent.
 */

import { COLLECTOR_COLORS } from "./album-logic";

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
