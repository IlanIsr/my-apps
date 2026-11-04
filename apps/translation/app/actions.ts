"use server";

/**
 * Server actions for everything that isn't a Claude call (those are API
 * routes under `app/api/pages/`, so two pages can run in parallel). Each one
 * resolves the signed-in Clerk user, validates its input and calls the store,
 * which scopes every query to that user.
 */

import { revalidatePath } from "next/cache";

import type {
  DocumentInfo,
  FullDocument,
  GlossaryEntry,
  Page,
  Settings,
} from "@/lib/model";
import { run, type Result } from "@/lib/result";
import * as store from "@/lib/store";
import * as v from "@/lib/validate";

/** The list and pages read fresh data server-side. */
const fresh = <T>(result: Result<T>): Result<T> => {
  if (result.ok) revalidatePath("/", "layout");
  return result;
};

// ---------------------------------------------------------------------------
// Documents

export async function createDocumentAction(
  input: unknown,
): Promise<Result<FullDocument>> {
  return fresh(
    await run((ownerId) =>
      store.createDocument(ownerId, v.documentInput(input)),
    ),
  );
}

export async function updateDocumentAction(
  id: string,
  patch: unknown,
): Promise<Result<DocumentInfo>> {
  return fresh(
    await run((ownerId) =>
      store.updateDocument(ownerId, v.id(id), v.documentPatch(patch)),
    ),
  );
}

export async function deleteDocumentAction(id: string): Promise<Result<null>> {
  return fresh(
    await run(async (ownerId) => {
      await store.deleteDocument(ownerId, v.id(id));
      return null;
    }),
  );
}

export async function addPagesAction(
  documentId: string,
  pages: unknown,
): Promise<Result<Page[]>> {
  return fresh(
    await run((ownerId) =>
      store.addPages(ownerId, v.id(documentId), v.pageInputs(pages)),
    ),
  );
}

// ---------------------------------------------------------------------------
// Pages (no revalidation: the workbench holds the state)

export async function saveReviewAction(
  pageId: string,
  patch: unknown,
): Promise<Result<Page>> {
  return run((ownerId) =>
    store.setReview(ownerId, v.id(pageId), v.reviewPatch(patch)),
  );
}

/** A corrected transcription: the translation is dropped (translate again). */
export async function saveTranscriptionAction(
  pageId: string,
  blocks: unknown,
): Promise<Result<Page>> {
  return run(async (ownerId) => {
    const ctx = await store.getPageContext(ownerId, v.id(pageId));
    if (!ctx) throw new store.StoreError("not-found");
    const list = v.blocks(blocks);
    if (!list.length) throw new v.InvalidInputError("blocks");
    const previous = ctx.page.transcription;
    return store.setTranscription(ownerId, ctx.page.id, {
      blocks: list,
      startsMid: previous?.startsMid ?? false,
      endsMid: previous?.endsMid ?? false,
      notes: previous?.notes ?? "",
    });
  });
}

export async function deletePageAction(pageId: string): Promise<Result<null>> {
  return fresh(
    await run(async (ownerId) => {
      await store.deletePage(ownerId, v.id(pageId));
      return null;
    }),
  );
}

export async function movePageAction(
  pageId: string,
  delta: number,
): Promise<Result<Page[]>> {
  return run((ownerId) =>
    store.movePage(ownerId, v.id(pageId), delta < 0 ? -1 : 1),
  );
}

// ---------------------------------------------------------------------------
// Glossary

export async function upsertGlossaryAction(
  entries: unknown,
): Promise<Result<GlossaryEntry[]>> {
  return fresh(
    await run((ownerId) =>
      store.upsertGlossary(ownerId, v.glossaryEntries(entries)),
    ),
  );
}

export async function updateGlossaryEntryAction(
  id: string,
  entry: unknown,
): Promise<Result<GlossaryEntry[]>> {
  return fresh(
    await run((ownerId) =>
      store.updateGlossaryEntry(ownerId, v.id(id), v.glossaryEntry(entry)),
    ),
  );
}

export async function deleteGlossaryEntriesAction(
  ids: unknown,
): Promise<Result<GlossaryEntry[]>> {
  return fresh(
    await run((ownerId) =>
      store.deleteGlossaryEntries(ownerId, v.ids(ids, 5000)),
    ),
  );
}

// ---------------------------------------------------------------------------
// Settings

export async function saveSettingsAction(
  settings: unknown,
): Promise<Result<Settings>> {
  return fresh(
    await run((ownerId) => store.saveSettings(ownerId, v.settings(settings))),
  );
}
