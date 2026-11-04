/**
 * The `{ ok, data | error }` envelope every server action and API route
 * returns, and the wrapper that resolves the signed-in user and maps failures
 * to a stable error code (the UI words each code itself).
 */

import "server-only";

import { DatabaseNotConfiguredError } from "@/db/client";

import { AiError } from "./claude";
import { currentOwnerId } from "./owner";
import { StoreError } from "./store";
import { InvalidInputError } from "./validate";
import type { ErrorCode } from "./errors";

export type Result<T> = { ok: true; data: T } | { ok: false; error: ErrorCode };

class NotSignedInError extends Error {}

export function errorCode(error: unknown): ErrorCode {
  if (error instanceof NotSignedInError) return "not-signed-in";
  if (error instanceof StoreError) return error.code;
  if (error instanceof AiError) return error.code;
  if (error instanceof InvalidInputError) return "invalid";
  if (error instanceof DatabaseNotConfiguredError) return "db-not-configured";
  console.error("[translation] request failed:", error);
  return "unknown";
}

export async function run<T>(
  fn: (ownerId: string) => Promise<T>,
): Promise<Result<T>> {
  try {
    const ownerId = await currentOwnerId();
    if (!ownerId) throw new NotSignedInError();
    return { ok: true, data: await fn(ownerId) };
  } catch (error) {
    return { ok: false, error: errorCode(error) };
  }
}
