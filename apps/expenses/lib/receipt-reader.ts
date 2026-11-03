/**
 * Reads a photo of a receipt with Claude (Vercel AI Gateway — authenticated
 * by the deployment's OIDC token on Vercel, `AI_GATEWAY_API_KEY` locally).
 * Server-only. The photo is never stored: the result only pre-fills the
 * receipt form, which the user checks before saving.
 *
 * Guard rails (every one has to pass before a request leaves):
 * - off unless `AI_PHOTO_ENABLED=1`;
 * - one call at a time per user (a `pending` call blocks the next); each
 *   call is logged in `ai_calls` (status + tokens) before it's made;
 * - exactly one request: no SDK retry, a 60 s timeout, output capped.
 */

import "server-only";

import { and, count, eq, gt, ne } from "drizzle-orm";
import { generateText, Output } from "ai";
import { z } from "zod";

import { db } from "@/db/client";
import { aiCalls } from "@/db/schema";

import { combineLines, LIMITS, type LineInput } from "./grocery-logic";

const MODEL = "anthropic/claude-sonnet-5.5";

export class ReaderError extends Error {
  constructor(
    /**
     * `photo-ai-off` = switched off, or the AI Gateway refused (no billing);
     * `photo-busy` = a call is running.
     */
    readonly code: "photo-unreadable" | "photo-ai-off" | "photo-busy",
  ) {
    super(code);
  }
}

/** A `pending` call older than this crashed: it no longer blocks. */
const STALE_MS = 2 * 60_000;

/** Checks every guard rail, then logs the call. Returns its id. */
async function reserveCall(ownerId: string): Promise<string> {
  if (process.env.AI_PHOTO_ENABLED !== "1")
    throw new ReaderError("photo-ai-off");
  const [running] = await db()
    .select({ n: count() })
    .from(aiCalls)
    .where(
      and(
        eq(aiCalls.ownerId, ownerId),
        eq(aiCalls.status, "pending"),
        gt(aiCalls.createdAt, new Date(Date.now() - STALE_MS)),
      ),
    );
  if (running!.n > 0) throw new ReaderError("photo-busy");
  const [row] = await db()
    .insert(aiCalls)
    .values({ ownerId, status: "pending" })
    .returning({ id: aiCalls.id });
  return row!.id;
}

async function finishCall(
  id: string,
  status: "ok" | "error",
  usage?: { inputTokens?: number; outputTokens?: number },
) {
  await db()
    .update(aiCalls)
    .set({
      status,
      inputTokens: usage?.inputTokens ?? null,
      outputTokens: usage?.outputTokens ?? null,
    })
    .where(and(eq(aiCalls.id, id), ne(aiCalls.status, status)));
}

const refused = (error: unknown) => {
  const status = (error as { statusCode?: number }).statusCode;
  return status === 401 || status === 403;
};

/** What the photo gave — every field may be missing. */
export type ReceiptDraft = {
  storeName: string | null;
  date: string | null;
  declaredTotal: number | null;
  lines: LineInput[];
};

const schema = z.object({
  storeName: z.string().nullable(),
  date: z.string().nullable().describe("YYYY-MM-DD"),
  total: z.number().nullable().describe("The total printed on the receipt"),
  lines: z.array(
    z.object({
      barcode: z.string().nullable(),
      label: z.string(),
      byWeight: z.boolean().describe("true when sold per kg (weighed)"),
      quantity: z
        .number()
        .describe("Number of pieces, or the weight in kg when byWeight"),
      unitPrice: z.number().describe("Price per piece, or per kg"),
      discount: z
        .number()
        .describe("Discount on this line, as a positive amount, else 0"),
    }),
  ),
});

const INSTRUCTIONS = `You read photos of supermarket receipts (often Israeli, in Hebrew, prices in shekels).
Extract the store name, the date (YYYY-MM-DD), the printed total and every purchased line in order.
For each line: the barcode if printed (digits only), the label exactly as printed, whether it is sold by weight, the quantity (pieces, or kg with decimals), the unit price (per piece or per kg) and its discount.
A discount printed on its own line right below an item is NOT an item: add it to that item's discount (positive number). The same item printed on several lines is ONE line with the quantities added up. Ignore payment, change, VAT and loyalty lines.
Amounts are numbers with a dot as decimal separator. Use null for anything you cannot read.`;

const cents = (n: number) => Math.max(0, Math.round(n * 100));

/** Labels of a receipt's discount lines (Hebrew / English / French). */
const DISCOUNT = /הנחה|מבצע|הטבה|discount|promo|remise|réduction/i;

export async function readReceiptPhoto(
  ownerId: string,
  photo: { data: string; mediaType: string },
): Promise<ReceiptDraft> {
  const callId = await reserveCall(ownerId);
  let output: z.infer<typeof schema>;
  try {
    const result = await generateText({
      model: MODEL,
      system: INSTRUCTIONS,
      output: Output.object({ schema }),
      // Exactly one request: no retry, bounded time and output.
      maxRetries: 0,
      maxOutputTokens: 6000,
      abortSignal: AbortSignal.timeout(60_000),
      messages: [
        {
          role: "user",
          content: [
            { type: "file", data: photo.data, mediaType: photo.mediaType },
            { type: "text", text: "Read this receipt." },
          ],
        },
      ],
    });
    output = result.output;
    await finishCall(callId, "ok", result.usage);
  } catch (error) {
    console.error("[expenses] receipt photo failed:", error);
    await finishCall(callId, "error").catch(() => {});
    throw new ReaderError(refused(error) ? "photo-ai-off" : "photo-unreadable");
  }
  const date =
    output.date && /^\d{4}-\d{2}-\d{2}$/.test(output.date) ? output.date : null;
  // The model may still return a discount as its own line, or the same item
  // several times: fixed here, not left to it.
  const lines: LineInput[] = [];
  for (const line of output.lines.slice(0, LIMITS.lines)) {
    const label = line.label.trim();
    const barcode =
      line.barcode?.replace(/\D/g, "").slice(0, LIMITS.barcode) || null;
    const prev = lines.at(-1);
    if (line.unitPrice < 0 || (!barcode && DISCOUNT.test(label))) {
      // A discount line: it lowers the item above.
      const amount = Math.max(
        cents(Math.abs(line.unitPrice * (line.quantity || 1))),
        cents(line.discount),
      );
      if (prev) prev.discount += amount;
      continue;
    }
    const quantityMilli = Math.round(line.quantity * 1000);
    if (!label || quantityMilli <= 0) continue;
    lines.push({
      barcode,
      label: label.slice(0, LIMITS.label),
      unit: line.byWeight ? "kg" : "unit",
      quantityMilli: Math.min(quantityMilli, LIMITS.quantityMilli),
      unitPrice: cents(line.unitPrice),
      discount: cents(line.discount),
    });
  }
  return {
    storeName: output.storeName?.trim().slice(0, LIMITS.storeName) || null,
    date,
    declaredTotal: output.total == null ? null : cents(output.total),
    lines: combineLines(lines),
  };
}
