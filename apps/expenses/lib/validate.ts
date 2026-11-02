/**
 * Server-side input validation for the actions. Each helper returns the
 * cleaned value or throws `InvalidInputError` — never trust what the client sent.
 */

import {
  EXPENSE_LIMITS,
  METHODS,
  type Method,
  type TransactionInput,
} from "./expense-logic";
import {
  LIMITS,
  UNITS,
  type LineInput,
  type ReceiptInput,
  type Unit,
} from "./grocery-logic";

export class InvalidInputError extends Error {
  constructor(field: string) {
    super(`invalid-${field}`);
    this.name = "InvalidInputError";
  }
}

function record(value: unknown, field: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new InvalidInputError(field);
  }
  return value as Record<string, unknown>;
}

export function text(value: unknown, field: string, max: number): string {
  if (typeof value !== "string") throw new InvalidInputError(field);
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed || trimmed.length > max) throw new InvalidInputError(field);
  return trimmed;
}

function optionalText(value: unknown, field: string, max: number) {
  if (value === null || value === undefined || value === "") return null;
  return text(value, field, max);
}

/** Trimmed, line breaks kept (a textarea), or `null` when empty. */
function optionalMultiline(value: unknown, field: string, max: number) {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") throw new InvalidInputError(field);
  const trimmed = value.trim();
  if (trimmed.length > max) throw new InvalidInputError(field);
  return trimmed || null;
}

export function int(value: unknown, field: string, min: number, max: number) {
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

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID.test(value);
}

export function barcode(value: unknown): string | null {
  const code = optionalText(value, "barcode", LIMITS.barcode);
  if (code !== null && !/^[0-9A-Za-z-]+$/.test(code)) {
    throw new InvalidInputError("barcode");
  }
  return code;
}

export function unit(value: unknown): Unit {
  if (!(UNITS as readonly unknown[]).includes(value)) {
    throw new InvalidInputError("unit");
  }
  return value as Unit;
}

function day(value: unknown): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new InvalidInputError("date");
  }
  if (Number.isNaN(new Date(`${value}T00:00:00Z`).getTime())) {
    throw new InvalidInputError("date");
  }
  return value;
}

function line(value: unknown): LineInput {
  const input = record(value, "line");
  return {
    barcode: barcode(input.barcode),
    label: text(input.label, "label", LIMITS.label),
    unit: unit(input.unit),
    quantityMilli: int(
      input.quantityMilli,
      "quantity",
      1,
      LIMITS.quantityMilli,
    ),
    unitPrice: int(input.unitPrice, "unitPrice", 0, LIMITS.cents),
    discount: int(input.discount, "discount", 0, LIMITS.cents),
  };
}

export function receiptInput(value: unknown): ReceiptInput {
  const input = record(value, "receipt");
  if (!Array.isArray(input.lines) || input.lines.length > LIMITS.lines) {
    throw new InvalidInputError("lines");
  }
  return {
    storeName: text(input.storeName, "storeName", LIMITS.storeName),
    date: day(input.date),
    declaredTotal:
      input.declaredTotal === null
        ? null
        : int(input.declaredTotal, "declaredTotal", 0, LIMITS.cents),
    note: optionalText(input.note, "note", LIMITS.note),
    method: method(input.method),
    categoryId: optionalId(input.categoryId, "categoryId"),
    lines: input.lines.map(line),
  };
}

export function method(value: unknown): Method {
  if (!(METHODS as readonly unknown[]).includes(value)) {
    throw new InvalidInputError("method");
  }
  return value as Method;
}

function optionalId(value: unknown, field: string): string | null {
  return value === null || value === undefined ? null : id(value, field);
}

export function transactionInput(value: unknown): TransactionInput {
  const input = record(value, "transaction");
  return {
    date: day(input.date),
    amount: int(input.amount, "amount", 1, LIMITS.cents),
    categoryId: optionalId(input.categoryId, "categoryId"),
    merchant: optionalText(input.merchant, "merchant", EXPENSE_LIMITS.merchant),
    method: method(input.method),
    note: optionalMultiline(input.note, "note", EXPENSE_LIMITS.note),
  };
}

export function categoryInput(value: unknown) {
  const input = record(value, "category");
  const budget =
    input.budget === null || input.budget === undefined
      ? null
      : int(input.budget, "budget", 0, LIMITS.cents);
  return {
    name: optionalText(input.name, "name", EXPENSE_LIMITS.categoryName),
    icon: text(input.icon, "icon", EXPENSE_LIMITS.icon),
    budget,
    archived: input.archived === true,
  };
}

export function importRows(value: unknown) {
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    value.length > EXPENSE_LIMITS.importRows
  ) {
    throw new InvalidInputError("rows");
  }
  return value.map((v) => {
    const row = record(v, "row");
    return {
      date: day(row.date),
      amount: int(row.amount, "amount", 1, LIMITS.cents),
      merchant: text(row.merchant, "merchant", EXPENSE_LIMITS.merchant),
      categoryId: optionalId(row.categoryId, "categoryId"),
      importKey: text(row.importKey, "importKey", 200),
    };
  });
}

export function productInput(value: unknown) {
  const input = record(value, "product");
  return {
    name: text(input.name, "name", LIMITS.label),
    barcode: barcode(input.barcode),
    unit: unit(input.unit),
  };
}
