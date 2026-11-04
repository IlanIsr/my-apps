/**
 * Claude calls (server-only): transcription (vision), translation and
 * assisted edits. Each reply is constrained to a Zod schema (structured
 * outputs) and parsed by the SDK. Failures are mapped to stable error codes
 * the UI words itself (`AiErrorCode`).
 *
 * Model: Claude Opus 5.5 for every step; the document's "quality" setting
 * only changes the effort level. Server-side refusal fallbacks are on, so a
 * policy decline is retried on another model inside the same call.
 */

import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";

import {
  BLOCK_TYPES,
  type Block,
  type BlockType,
  type Quality,
  type Term,
  type Transcription,
} from "./model";

export const MODEL = "claude-opus-5-5";

const EFFORT: Record<Quality, "high" | "xhigh"> = {
  standard: "high",
  max: "xhigh",
};

export type AiErrorCode =
  | "ai-not-configured"
  | "rate-limited"
  | "overloaded"
  | "refused"
  | "too-large"
  | "invalid-reply"
  | "ai-failed";

export class AiError extends Error {
  constructor(public readonly code: AiErrorCode) {
    super(code);
    this.name = "AiError";
  }
}

let client: Anthropic | null = null;

function anthropic(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("[translation] ANTHROPIC_API_KEY is not set.");
    throw new AiError("ai-not-configured");
  }
  // Retries 408/409/429/5xx with backoff on its own.
  client ??= new Anthropic({ maxRetries: 4 });
  return client;
}

export type ImageInput = {
  data: Buffer;
  mediaType: "image/jpeg" | "image/png";
};

async function call<T>(input: {
  system: string;
  content: Anthropic.Beta.BetaContentBlockParam[];
  schema: z.ZodType<T>;
  quality: Quality;
}): Promise<T> {
  try {
    const response = await anthropic().beta.messages.parse({
      model: MODEL,
      max_tokens: 20000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: {
        effort: EFFORT[input.quality],
        format: betaZodOutputFormat(input.schema),
      },
      system: input.system,
      messages: [{ role: "user", content: input.content }],
    });
    if (response.stop_reason === "refusal") throw new AiError("refused");
    if (response.stop_reason === "max_tokens") {
      throw new AiError("invalid-reply");
    }
    if (!response.parsed_output) throw new AiError("invalid-reply");
    return response.parsed_output;
  } catch (error) {
    throw toAiError(error);
  }
}

function toAiError(error: unknown): AiError {
  if (error instanceof AiError) return error;
  if (error instanceof Anthropic.AuthenticationError) {
    console.error("[translation] Anthropic authentication failed.");
    return new AiError("ai-not-configured");
  }
  if (error instanceof Anthropic.PermissionDeniedError) {
    console.error("[translation] Anthropic permission denied:", error.message);
    return new AiError("ai-not-configured");
  }
  if (error instanceof Anthropic.RateLimitError)
    return new AiError("rate-limited");
  if (error instanceof Anthropic.BadRequestError) {
    console.error("[translation] Claude rejected the request:", error.message);
    return new AiError(
      /too large|too long|exceeds|maximum/i.test(error.message)
        ? "too-large"
        : "ai-failed",
    );
  }
  if (error instanceof Anthropic.APIError) {
    console.error(
      `[translation] Claude API error ${error.status}:`,
      error.message,
    );
    return new AiError(error.status === 529 ? "overloaded" : "ai-failed");
  }
  console.error("[translation] Claude call failed:", error);
  return new AiError("ai-failed");
}

// ---------------------------------------------------------------------------
// Schemas

const TranscriptionSchema = z.object({
  blocks: z.array(
    z.object({
      // A plain string (not an enum): an unexpected type maps to "other"
      // instead of failing the whole page.
      type: z.string().describe(`One of: ${BLOCK_TYPES.join(", ")}`),
      text: z.string(),
    }),
  ),
  startsMid: z.boolean(),
  endsMid: z.boolean(),
  notes: z.string(),
});

const TranslationSchema = z.object({
  translation: z.string(),
  terms: z.array(
    z.object({ source: z.string(), rendering: z.string(), note: z.string() }),
  ),
  doubts: z.array(z.string()),
});

const EditSchema = z.object({ translation: z.string(), changed: z.string() });

// ---------------------------------------------------------------------------
// Steps

export async function transcribe(input: {
  system: string;
  user: string;
  images: ImageInput[];
  quality: Quality;
}): Promise<Transcription> {
  const reply = await call({
    system: input.system,
    schema: TranscriptionSchema,
    quality: input.quality,
    content: [
      ...input.images.map((img): Anthropic.Beta.BetaImageBlockParam => ({
        type: "image",
        source: {
          type: "base64",
          media_type: img.mediaType,
          data: img.data.toString("base64"),
        },
      })),
      { type: "text", text: input.user },
    ],
  });
  const blocks: Block[] = reply.blocks
    .map((b) => ({
      type: (BLOCK_TYPES as readonly string[]).includes(b.type)
        ? (b.type as BlockType)
        : "other",
      text: b.text.trim(),
    }))
    .filter((b) => b.text);
  if (!blocks.length) throw new AiError("invalid-reply");
  return {
    blocks,
    startsMid: reply.startsMid,
    endsMid: reply.endsMid,
    notes: reply.notes.trim(),
  };
}

export async function translate(input: {
  system: string;
  user: string;
  quality: Quality;
}): Promise<{ text: string; terms: Term[]; doubts: string[] }> {
  const reply = await call({
    system: input.system,
    schema: TranslationSchema,
    quality: input.quality,
    content: [{ type: "text", text: input.user }],
  });
  const text = reply.translation.trim();
  if (!text) throw new AiError("invalid-reply");
  return {
    text,
    terms: reply.terms
      .filter((t) => t.source.trim())
      .slice(0, 6)
      .map((t) => ({
        source: t.source.trim(),
        rendering: t.rendering.trim(),
        note: t.note.trim(),
      })),
    doubts: reply.doubts
      .map((d) => d.trim())
      .filter(Boolean)
      .slice(0, 6),
  };
}

export async function edit(input: {
  system: string;
  user: string;
  quality: Quality;
}): Promise<{ text: string; changed: string }> {
  const reply = await call({
    system: input.system,
    schema: EditSchema,
    quality: input.quality,
    content: [{ type: "text", text: input.user }],
  });
  const text = reply.translation.trim();
  if (!text) throw new AiError("invalid-reply");
  return { text, changed: reply.changed.trim() };
}
