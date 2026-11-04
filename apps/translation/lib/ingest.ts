/**
 * Turning dropped files into pages, in the browser (nothing is uploaded here).
 *
 * - PDF: each page rendered to a JPEG (pdf.js). Its text layer is kept as a
 *   reference for Claude only when it looks sound (enough letters, no broken
 *   encoding, Hebrew in logical order).
 * - Word (.docx): the text is exact, no AI reading needed; it is cut into
 *   sections of about one page at paragraph boundaries.
 * - Photos (JPEG / PNG / WebP): EXIF orientation applied, scaled down.
 *
 * Also: rotating a prepared page, and the images sent for one transcription
 * (the page, plus two overlapping halves for small print).
 */

import type { PageInput, Transcription } from "./model";

export const MAX_EDGE = 2200;
export const MAX_PAGES = 60;
const DOCX_CHUNK = 2600;

/** A page ready to become a `PageInput`, with its scan (if any). */
export type PreparedPage = Omit<PageInput, "translation"> & {
  key: string;
  blob: Blob | null;
  /** Object URL of `blob`, for the preview. */
  url: string | null;
};

export type IngestReport = {
  pages: PreparedPage[];
  skipped: string[];
  truncated: boolean;
};

let keySeq = 0;
const nextKey = () => `p${Date.now().toString(36)}${(keySeq += 1)}`;

const canvasToBlob = (c: HTMLCanvasElement, quality = 0.9) =>
  new Promise<Blob>((resolve, reject) =>
    c.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      "image/jpeg",
      quality,
    ),
  );

function whiteCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, c.width, c.height);
  return { c, ctx };
}

function prepared(input: Omit<PreparedPage, "key" | "url">): PreparedPage {
  return {
    ...input,
    key: nextKey(),
    url: input.blob ? URL.createObjectURL(input.blob) : null,
  };
}

export function releasePages(pages: readonly PreparedPage[]) {
  for (const p of pages) if (p.url) URL.revokeObjectURL(p.url);
}

// ---------------------------------------------------------------------------
// PDF

function textLayerToString(items: unknown[]): string {
  let s = "";
  for (const it of items) {
    const item = it as { str?: unknown; hasEOL?: boolean };
    if (typeof item.str !== "string") continue;
    s += item.str + (item.hasEOL ? "\n" : " ");
  }
  return s
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .trim();
}

/** Keep a PDF's text only if it looks sound; else say why. */
export function checkTextLayer(
  text: string,
): { ok: true } | { ok: false; why: string } {
  const letters = (text.match(/\p{L}/gu) ?? []).length;
  if (letters < 40) return { ok: false, why: "no-text" };
  const broken = (text.match(/[�-]/g) ?? []).length;
  if (broken > letters * 0.02) return { ok: false, why: "broken-encoding" };
  const words = text.match(/[א-ת]{2,}/g) ?? [];
  let finalAtStart = 0;
  let finalAtEnd = 0;
  for (const w of words) {
    if (/^[ךםןףץ]/.test(w)) finalAtStart += 1;
    if (/[ךםןףץ]$/.test(w)) finalAtEnd += 1;
  }
  if (words.length > 10 && finalAtStart > finalAtEnd) {
    return { ok: false, why: "reversed-hebrew" };
  }
  return { ok: true };
}

async function ingestPdf(file: File, out: PreparedPage[], max: number) {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
  const task = pdfjs.getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
    useSystemFonts: true,
  });
  const pdf = await task.promise;
  try {
    for (let i = 1; i <= pdf.numPages && out.length < max; i += 1) {
      const page = await pdf.getPage(i);
      const base = page.getViewport({ scale: 1 });
      const scale = Math.min(4, MAX_EDGE / Math.max(base.width, base.height));
      const viewport = page.getViewport({ scale });
      const { c } = whiteCanvas(viewport.width, viewport.height);
      await page.render({ canvas: c, viewport, background: "#ffffff" }).promise;
      let text = "";
      try {
        text = textLayerToString((await page.getTextContent()).items);
      } catch {
        // no text layer
      }
      const check = checkTextLayer(text);
      const blob = await canvasToBlob(c, 0.9);
      out.push(
        prepared({
          blob,
          width: c.width,
          height: c.height,
          origin: check.ok ? "pdf-text" : "pdf-scan",
          pdfText: check.ok ? text.slice(0, 20000) : null,
          textNote: check.ok || !text ? null : check.why,
          source: `${file.name} · p. ${i}`,
          hasImage: true,
          transcription: null,
        }),
      );
      c.width = c.height = 0;
      page.cleanup();
    }
  } finally {
    await task.destroy();
  }
}

// ---------------------------------------------------------------------------
// Word

async function ingestDocx(file: File, out: PreparedPage[], max: number) {
  const mammoth = await import("mammoth");
  const { value } = await mammoth.extractRawText({
    arrayBuffer: await file.arrayBuffer(),
  });
  const paras = value
    .split(/\n+/)
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  if (!paras.length) throw new Error("empty document");
  const chunks: string[][] = [];
  let current: string[] = [];
  let length = 0;
  for (const p of paras) {
    if (length + p.length > DOCX_CHUNK && current.length) {
      chunks.push(current);
      current = [];
      length = 0;
    }
    current.push(p);
    length += p.length;
  }
  if (current.length) chunks.push(current);
  chunks.forEach((chunk, i) => {
    if (out.length >= max) return;
    const transcription: Transcription = {
      blocks: chunk.map((text) => ({ type: "paragraph", text })),
      startsMid: false,
      endsMid: false,
      notes: "",
    };
    out.push(
      prepared({
        blob: null,
        width: 0,
        height: 0,
        origin: "docx",
        pdfText: null,
        textNote: null,
        source: `${file.name} · ${i + 1}/${chunks.length}`,
        hasImage: false,
        transcription,
      }),
    );
  });
}

// ---------------------------------------------------------------------------
// Photos

async function ingestImage(file: File): Promise<PreparedPage> {
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  });
  const k = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const { c, ctx } = whiteCanvas(bitmap.width * k, bitmap.height * k);
  ctx.drawImage(bitmap, 0, 0, c.width, c.height);
  bitmap.close();
  const blob = await canvasToBlob(c, 0.9);
  return prepared({
    blob,
    width: c.width,
    height: c.height,
    origin: "photo",
    pdfText: null,
    textNote: null,
    source: file.name,
    hasImage: true,
    transcription: null,
  });
}

const isPdf = (f: File) =>
  f.type === "application/pdf" || /\.pdf$/i.test(f.name);
const isDocx = (f: File) =>
  /\.docx$/i.test(f.name) ||
  f.type ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const isImage = (f: File) => /^image\/(jpeg|png|webp)$/.test(f.type);

export const ACCEPT =
  ".pdf,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/webp";

/** Files → pages, in the order given; at most `max` pages. */
export async function ingestFiles(
  files: readonly File[],
  max = MAX_PAGES,
): Promise<IngestReport> {
  const pages: PreparedPage[] = [];
  const skipped: string[] = [];
  let truncated = false;
  for (const file of files) {
    if (pages.length >= max) {
      truncated = true;
      break;
    }
    try {
      if (isPdf(file)) await ingestPdf(file, pages, max);
      else if (isDocx(file)) await ingestDocx(file, pages, max);
      else if (isImage(file)) pages.push(await ingestImage(file));
      else skipped.push(file.name);
    } catch (error) {
      console.error("[translation] could not read", file.name, error);
      skipped.push(file.name);
    }
  }
  return { pages, skipped, truncated };
}

/** A quarter turn clockwise. */
export async function rotatePage(page: PreparedPage): Promise<PreparedPage> {
  if (!page.blob) return page;
  const bitmap = await createImageBitmap(page.blob);
  const { c, ctx } = whiteCanvas(bitmap.height, bitmap.width);
  ctx.translate(c.width, 0);
  ctx.rotate(Math.PI / 2);
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const blob = await canvasToBlob(c, 0.9);
  if (page.url) URL.revokeObjectURL(page.url);
  return {
    ...page,
    blob,
    url: URL.createObjectURL(blob),
    width: c.width,
    height: c.height,
  };
}

export function toPageInput(page: PreparedPage): PageInput {
  return {
    origin: page.origin,
    source: page.source,
    pdfText: page.pdfText,
    textNote: page.textNote,
    width: page.width,
    height: page.height,
    hasImage: page.hasImage,
    transcription: page.transcription,
    translation: null,
  };
}

// ---------------------------------------------------------------------------
// Sending a page to Claude

const UPLOAD_BUDGET = 3_800_000;

async function encode(bitmap: ImageBitmap, y0: number, y1: number, q: number) {
  const { c, ctx } = whiteCanvas(bitmap.width, y1 - y0);
  ctx.drawImage(
    bitmap,
    0,
    y0,
    bitmap.width,
    c.height,
    0,
    0,
    bitmap.width,
    c.height,
  );
  const blob = await canvasToBlob(c, q);
  c.width = c.height = 0;
  return blob;
}

/**
 * The images for one transcription: the page, plus (tall scans, high-res on,
 * no PDF text) its upper and lower halves overlapping by ~12%. Re-encoded
 * smaller if the total would exceed the upload limit.
 */
export async function imagesForTranscription(
  scan: Blob,
  options: { highRes: boolean; hasPdfText: boolean },
): Promise<{ images: Blob[]; bands: boolean }> {
  const bitmap = await createImageBitmap(scan);
  try {
    const H = bitmap.height;
    const bands =
      options.highRes && !options.hasPdfText && H > bitmap.width * 1.15;
    for (const q of [0.9, 0.8, 0.7, 0.6]) {
      const whole =
        q === 0.9 && scan.size < UPLOAD_BUDGET
          ? scan
          : await encode(bitmap, 0, H, q);
      const images = bands
        ? [
            whole,
            await encode(bitmap, 0, H * 0.56, q),
            await encode(bitmap, H * 0.44, H, q),
          ]
        : [whole];
      const total = images.reduce((s, b) => s + b.size, 0);
      if (total <= UPLOAD_BUDGET) return { images, bands };
      if (bands && q === 0.6) break;
    }
    // Still too big: the whole page alone, smaller.
    return { images: [await encode(bitmap, 0, H, 0.6)], bands: false };
  } finally {
    bitmap.close();
  }
}
