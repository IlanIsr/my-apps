/** Shared plumbing for the API routes: JSON envelope + body parsing. */

import "server-only";

import { NextResponse } from "next/server";

import type { Result } from "./result";

export function json<T>(result: Result<T>): NextResponse {
  return NextResponse.json(result, {
    status: result.ok ? 200 : result.error === "not-signed-in" ? 401 : 200,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
