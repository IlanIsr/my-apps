/**
 * Browser calls to the Claude API routes. Same `{ ok, data | error }`
 * envelope as the server actions; a network failure or a non-JSON reply
 * (e.g. the session expired and the proxy redirected) maps to an error code.
 */

import type { ErrorCode } from "./errors";
import type { NoteLang, Page } from "./model";

export type ApiResult<T> =
  { ok: true; data: T } | { ok: false; error: ErrorCode };

async function call<T>(
  url: string,
  body: BodyInit,
  signal?: AbortSignal,
  json = true,
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(url, {
      method: "POST",
      body,
      signal,
      headers: json ? { "Content-Type": "application/json" } : undefined,
    });
    if (response.status === 401) return { ok: false, error: "not-signed-in" };
    if (response.status === 413) return { ok: false, error: "too-large" };
    const type = response.headers.get("content-type") ?? "";
    if (!type.includes("application/json")) {
      return {
        ok: false,
        error: response.redirected ? "not-signed-in" : "unknown",
      };
    }
    return (await response.json()) as ApiResult<T>;
  } catch (error) {
    if (signal?.aborted) throw error;
    return { ok: false, error: "unknown" };
  }
}

export function transcribe(
  pageId: string,
  images: Blob[],
  noteLang: NoteLang,
  signal?: AbortSignal,
): Promise<ApiResult<Page>> {
  const form = new FormData();
  images.forEach((img, i) => form.append("image", img, `page-${i}.jpg`));
  form.append("noteLang", noteLang);
  return call(`/api/pages/${pageId}/transcribe`, form, signal, false);
}

export function translate(
  pageId: string,
  noteLang: NoteLang,
  signal?: AbortSignal,
): Promise<ApiResult<Page>> {
  return call(
    `/api/pages/${pageId}/translate`,
    JSON.stringify({ noteLang }),
    signal,
  );
}

export function edit(
  pageId: string,
  body: {
    action: "replace" | "add" | "remove";
    passage: string;
    newText: string;
    position: "after" | "before" | "end" | "note" | null;
    remark: string;
    translation: string;
    noteLang: NoteLang;
  },
  signal?: AbortSignal,
): Promise<ApiResult<{ text: string; changed: string }>> {
  return call(`/api/pages/${pageId}/edit`, JSON.stringify(body), signal);
}
