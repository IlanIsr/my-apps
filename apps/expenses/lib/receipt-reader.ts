/**
 * Reads a photo of a receipt with Claude (Vercel AI Gateway — authenticated
 * by the deployment's OIDC token on Vercel, `AI_GATEWAY_API_KEY` locally).
 * Server-only. The photo is never stored: the result only pre-fills the
 * receipt form, which the user checks before saving.
 */

import "server-only";

import { generateText, Output } from "ai";
import { z } from "zod";

import { LIMITS, type LineInput } from "./grocery-logic";

const MODEL = "anthropic/claude-sonnet-5.5";

export class ReaderError extends Error {
  constructor(
    /** `photo-ai-off` = the AI Gateway refused (not set up / no billing). */
    readonly code: "photo-unreadable" | "photo-ai-off",
  ) {
    super(code);
  }
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
A discount printed on its own line right below an item belongs to that item (positive number). Ignore payment, change, VAT and loyalty lines.
Amounts are numbers with a dot as decimal separator. Use null for anything you cannot read.`;

const cents = (n: number) => Math.max(0, Math.round(n * 100));

export async function readReceiptPhoto(photo: {
  data: string;
  mediaType: string;
}): Promise<ReceiptDraft> {
  let output: z.infer<typeof schema>;
  try {
    const result = await generateText({
      model: MODEL,
      system: INSTRUCTIONS,
      output: Output.object({ schema }),
      messages: [
        {
          role: "user",
          content: [
            { type: "image", image: photo.data, mediaType: photo.mediaType },
            { type: "text", text: "Read this receipt." },
          ],
        },
      ],
    });
    output = result.output;
  } catch (error) {
    console.error("[expenses] receipt photo failed:", error);
    throw new ReaderError(refused(error) ? "photo-ai-off" : "photo-unreadable");
  }
  const date =
    output.date && /^\d{4}-\d{2}-\d{2}$/.test(output.date) ? output.date : null;
  const lines = output.lines
    .slice(0, LIMITS.lines)
    .map((line): LineInput | null => {
      const quantityMilli = Math.round(line.quantity * 1000);
      if (!line.label.trim() || quantityMilli <= 0) return null;
      return {
        barcode:
          line.barcode?.replace(/\D/g, "").slice(0, LIMITS.barcode) || null,
        label: line.label.trim().slice(0, LIMITS.label),
        unit: line.byWeight ? "kg" : "unit",
        quantityMilli: Math.min(quantityMilli, LIMITS.quantityMilli),
        unitPrice: cents(line.unitPrice),
        discount: cents(line.discount),
      };
    })
    .filter((l): l is LineInput => l !== null);
  return {
    storeName: output.storeName?.trim().slice(0, LIMITS.storeName) || null,
    date,
    declaredTotal: output.total == null ? null : cents(output.total),
    lines,
  };
}
