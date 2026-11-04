/**
 * The three Claude steps, as the API routes run them: load the page with its
 * document and neighbours, build the prompt, call Claude, store the result.
 * A failure is also stored on the page (`pages.error`) so it shows after a
 * reload.
 */

import "server-only";

import * as claude from "./claude";
import { normalizeHebrew } from "./checks";
import { bodyText, type NoteLang, type Page } from "./model";
import * as prompts from "./prompts";
import { errorCode } from "./result";
import * as store from "./store";

/** Runs `fn`; on failure records the error code on the page, then rethrows. */
async function recordingErrors<T>(
  ownerId: string,
  pageId: string,
  fn: () => Promise<T>,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const code = errorCode(error);
    if (code !== "not-found") {
      await store.setError(ownerId, pageId, code).catch(() => undefined);
    }
    throw error;
  }
}

export async function transcribePage(input: {
  ownerId: string;
  pageId: string;
  images: claude.ImageInput[];
  bands: boolean;
  noteLang: NoteLang;
}): Promise<Page> {
  const ctx = await store.getPageContext(input.ownerId, input.pageId);
  if (!ctx) throw new store.StoreError("not-found");
  return recordingErrors(input.ownerId, input.pageId, async () => {
    const transcription = await claude.transcribe({
      system: prompts.transcriptionSystem(input.noteLang),
      user: prompts.transcriptionUser({
        bands: input.bands && input.images.length === 3,
        pdfText: ctx.page.pdfText,
      }),
      images: input.images,
      quality: ctx.document.quality,
    });
    return store.setTranscription(input.ownerId, input.pageId, transcription);
  });
}

const CONTEXT_CHARS = 700;

export async function translatePage(input: {
  ownerId: string;
  pageId: string;
  noteLang: NoteLang;
}): Promise<Page> {
  const ctx = await store.getPageContext(input.ownerId, input.pageId);
  if (!ctx) throw new store.StoreError("not-found");
  const page = ctx.page.transcription;
  if (!page) throw new store.StoreError("not-found");
  const { document } = ctx;
  return recordingErrors(input.ownerId, input.pageId, async () => {
    const prev = ctx.previous?.transcription;
    const next = ctx.next?.transcription;
    // Only the glossary terms this page actually contains.
    const source = normalizeHebrew(page.blocks.map((b) => b.text).join("\n"));
    const glossary = (await store.listGlossary(input.ownerId)).filter(
      (g) =>
        g.lang === document.target &&
        source.includes(normalizeHebrew(g.source)),
    );
    const reply = await claude.translate({
      system: prompts.translationSystem({
        target: document.target,
        noteLang: input.noteLang,
      }),
      user: prompts.translationUser({
        doctype: document.doctype,
        title: document.title,
        page,
        previous:
          prev && (page.startsMid || prev.endsMid)
            ? bodyText(prev).slice(-CONTEXT_CHARS)
            : null,
        next:
          next && (page.endsMid || next.startsMid)
            ? bodyText(next).slice(0, CONTEXT_CHARS)
            : null,
        glossary,
      }),
      quality: document.quality,
    });
    return store.setTranslation(input.ownerId, input.pageId, {
      ...reply,
      lang: document.target,
    });
  });
}

export type EditInput = {
  action: "replace" | "add" | "remove";
  passage: string;
  newText: string;
  position: "after" | "before" | "end" | "note" | null;
  remark: string;
  translation: string;
  noteLang: NoteLang;
};

/** Claude applies one reviewer edit; nothing is stored (the client saves it
 * with the flag's resolution). */
export async function editPage(input: {
  ownerId: string;
  pageId: string;
  edit: EditInput;
}): Promise<{ text: string; changed: string }> {
  const ctx = await store.getPageContext(input.ownerId, input.pageId);
  if (!ctx?.page.transcription) throw new store.StoreError("not-found");
  const { edit } = input;
  const target = edit.passage
    ? `"${edit.passage}"`
    : "the passage this remark is about";
  const where = {
    after: `right after ${target}`,
    before: `right before ${target}`,
    end: "at the end of the page",
    note: "as a translator's note at the end of the page",
  };
  const instruction =
    edit.action === "replace"
      ? `Replace ${target} with: "${edit.newText}". Adjust only the surrounding words needed for grammar.`
      : edit.action === "remove"
        ? `Remove ${target}. Adjust only the surrounding words needed for grammar.`
        : `Add this text: "${edit.newText}" ${edit.position ? where[edit.position] : "where it belongs"}.`;
  return claude.edit({
    system: prompts.editSystem({
      target: ctx.document.target,
      noteLang: edit.noteLang,
    }),
    user: prompts.editUser({
      page: ctx.page.transcription,
      translation: edit.translation,
      remark: edit.remark,
      instruction,
    }),
    quality: ctx.document.quality,
  });
}
