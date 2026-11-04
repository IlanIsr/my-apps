/**
 * Persistence for documents, pages, the glossary and settings. Every function
 * takes the Clerk user id first and only ever touches that user's rows.
 * Multi-statement writes go through `db().batch(...)` (one transaction on Neon).
 */

import "server-only";

import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";

import { db } from "@/db/client";
import { documents, glossaryEntries, pages, userSettings } from "@/db/schema";

import {
  DEFAULT_SETTINGS,
  type Doctype,
  type DocumentInfo,
  type DocumentInput,
  type DocumentPatch,
  type DocumentSummary,
  type FullDocument,
  type GlossaryEntry,
  type Page,
  type PageInput,
  type PageOrigin,
  type Quality,
  type Resolution,
  type Settings,
  type TargetLang,
  type Transcription,
  type Translation,
} from "./model";

export type StoreErrorCode = "not-found" | "too-many-pages";

export class StoreError extends Error {
  constructor(public readonly code: StoreErrorCode) {
    super(code);
    this.name = "StoreError";
  }
}

type DocumentRow = typeof documents.$inferSelect;
type PageRow = typeof pages.$inferSelect;

function toDocument(row: DocumentRow): DocumentInfo {
  return {
    id: row.id,
    title: row.title,
    target: row.target as TargetLang,
    doctype: row.doctype as Doctype,
    quality: row.quality as Quality,
    highRes: row.highRes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toPage(row: PageRow): Page {
  return {
    id: row.id,
    documentId: row.documentId,
    position: row.position,
    origin: row.origin as PageOrigin,
    source: row.source,
    hasPdfText: Boolean(row.pdfText),
    textNote: row.textNote,
    width: row.width,
    height: row.height,
    hasImage: row.hasImage,
    transcription: row.transcription ?? null,
    translation: row.translation ?? null,
    resolved: row.resolved,
    reviewed: row.reviewed,
    error: row.error,
    updatedAt: row.updatedAt.toISOString(),
  };
}

const ownDocument = (ownerId: string, id: string) =>
  and(eq(documents.ownerId, ownerId), eq(documents.id, id));
const ownPage = (ownerId: string, id: string) =>
  and(eq(pages.ownerId, ownerId), eq(pages.id, id));

const MAX_PAGES = 60;

// ---------------------------------------------------------------------------
// Documents

export async function listDocuments(
  ownerId: string,
): Promise<DocumentSummary[]> {
  const rows = await db()
    .select()
    .from(documents)
    .where(eq(documents.ownerId, ownerId))
    .orderBy(desc(documents.updatedAt));
  if (!rows.length) return [];
  const stats = await db()
    .select({
      documentId: pages.documentId,
      pages: sql<number>`count(*)::int`,
      transcribed: sql<number>`count(${pages.transcription})::int`,
      translated: sql<number>`count(${pages.translation})::int`,
      reviewed: sql<number>`count(*) filter (where ${pages.reviewed})::int`,
    })
    .from(pages)
    .where(eq(pages.ownerId, ownerId))
    .groupBy(pages.documentId);
  const byId = new Map(stats.map((s) => [s.documentId, s]));
  return rows.map((row) => {
    const s = byId.get(row.id);
    return {
      ...toDocument(row),
      pages: s?.pages ?? 0,
      transcribed: s?.transcribed ?? 0,
      translated: s?.translated ?? 0,
      reviewed: s?.reviewed ?? 0,
    };
  });
}

export async function getDocument(
  ownerId: string,
  id: string,
): Promise<FullDocument | null> {
  const [row] = await db()
    .select()
    .from(documents)
    .where(ownDocument(ownerId, id));
  if (!row) return null;
  const pageRows = await db()
    .select()
    .from(pages)
    .where(and(eq(pages.ownerId, ownerId), eq(pages.documentId, id)))
    .orderBy(asc(pages.position));
  return { document: toDocument(row), pages: pageRows.map(toPage) };
}

function pageValues(
  ownerId: string,
  documentId: string,
  position: number,
  p: PageInput,
) {
  return {
    ownerId,
    documentId,
    position,
    origin: p.origin,
    source: p.source,
    pdfText: p.pdfText,
    textNote: p.textNote,
    width: p.width,
    height: p.height,
    hasImage: p.hasImage,
    transcription: p.transcription,
    translation: p.translation,
  };
}

export async function createDocument(
  ownerId: string,
  input: DocumentInput,
): Promise<FullDocument> {
  const [row] = await db()
    .insert(documents)
    .values({
      ownerId,
      title: input.title,
      target: input.target,
      doctype: input.doctype,
      quality: input.quality,
      highRes: input.highRes,
    })
    .returning();
  const doc = row!;
  const pageRows = input.pages.length
    ? await db()
        .insert(pages)
        .values(input.pages.map((p, i) => pageValues(ownerId, doc.id, i, p)))
        .returning()
    : [];
  return {
    document: toDocument(doc),
    pages: pageRows.sort((a, b) => a.position - b.position).map(toPage),
  };
}

async function touchDocument(ownerId: string, id: string) {
  await db()
    .update(documents)
    .set({ updatedAt: new Date() })
    .where(ownDocument(ownerId, id));
}

export async function updateDocument(
  ownerId: string,
  id: string,
  patch: DocumentPatch,
): Promise<DocumentInfo> {
  const [row] = await db()
    .update(documents)
    .set({ ...patch, updatedAt: new Date() })
    .where(ownDocument(ownerId, id))
    .returning();
  if (!row) throw new StoreError("not-found");
  return toDocument(row);
}

export async function deleteDocument(
  ownerId: string,
  id: string,
): Promise<void> {
  await db().delete(documents).where(ownDocument(ownerId, id));
}

export async function addPages(
  ownerId: string,
  documentId: string,
  input: PageInput[],
): Promise<Page[]> {
  const doc = await getDocument(ownerId, documentId);
  if (!doc) throw new StoreError("not-found");
  if (doc.pages.length + input.length > MAX_PAGES) {
    throw new StoreError("too-many-pages");
  }
  const start = (doc.pages.at(-1)?.position ?? -1) + 1;
  const rows = await db()
    .insert(pages)
    .values(input.map((p, i) => pageValues(ownerId, documentId, start + i, p)))
    .returning();
  await touchDocument(ownerId, documentId);
  return rows.sort((a, b) => a.position - b.position).map(toPage);
}

// ---------------------------------------------------------------------------
// Pages

/** The page plus what the AI steps need from its document. */
export async function getPageContext(
  ownerId: string,
  pageId: string,
): Promise<{
  page: PageRow;
  document: DocumentInfo;
  previous: PageRow | null;
  next: PageRow | null;
} | null> {
  const [page] = await db()
    .select()
    .from(pages)
    .where(ownPage(ownerId, pageId));
  if (!page) return null;
  const [doc] = await db()
    .select()
    .from(documents)
    .where(ownDocument(ownerId, page.documentId));
  if (!doc) return null;
  const siblings = await db()
    .select()
    .from(pages)
    .where(
      and(eq(pages.ownerId, ownerId), eq(pages.documentId, page.documentId)),
    )
    .orderBy(asc(pages.position));
  const i = siblings.findIndex((p) => p.id === pageId);
  return {
    page,
    document: toDocument(doc),
    previous: siblings[i - 1] ?? null,
    next: siblings[i + 1] ?? null,
  };
}

async function patchPage(
  ownerId: string,
  pageId: string,
  patch: Partial<typeof pages.$inferInsert>,
): Promise<Page> {
  const [row] = await db()
    .update(pages)
    .set({ ...patch, updatedAt: new Date() })
    .where(ownPage(ownerId, pageId))
    .returning();
  if (!row) throw new StoreError("not-found");
  await touchDocument(ownerId, row.documentId);
  return toPage(row);
}

/** A new transcription invalidates the translation and the review. */
export function setTranscription(
  ownerId: string,
  pageId: string,
  transcription: Transcription,
): Promise<Page> {
  return patchPage(ownerId, pageId, {
    transcription,
    translation: null,
    resolved: {},
    reviewed: false,
    error: null,
  });
}

/** A new translation starts a fresh review. */
export function setTranslation(
  ownerId: string,
  pageId: string,
  translation: Translation,
): Promise<Page> {
  return patchPage(ownerId, pageId, {
    translation,
    resolved: {},
    reviewed: false,
    error: null,
  });
}

export function setError(
  ownerId: string,
  pageId: string,
  error: string | null,
): Promise<Page> {
  return patchPage(ownerId, pageId, { error });
}

export function setReview(
  ownerId: string,
  pageId: string,
  patch: {
    resolved?: Record<string, Resolution>;
    reviewed?: boolean;
    text?: string;
  },
): Promise<Page> {
  return (async () => {
    const values: Partial<typeof pages.$inferInsert> = {};
    if (patch.resolved) values.resolved = patch.resolved;
    if (patch.reviewed !== undefined) values.reviewed = patch.reviewed;
    if (patch.text !== undefined) {
      const [row] = await db()
        .select()
        .from(pages)
        .where(ownPage(ownerId, pageId));
      if (!row?.translation) throw new StoreError("not-found");
      values.translation = { ...row.translation, text: patch.text };
    }
    return patchPage(ownerId, pageId, values);
  })();
}

export async function deletePage(
  ownerId: string,
  pageId: string,
): Promise<void> {
  const [row] = await db()
    .delete(pages)
    .where(ownPage(ownerId, pageId))
    .returning({ documentId: pages.documentId });
  if (row) await renumber(ownerId, row.documentId);
}

/** Positions back to 0..n-1 in the current order. */
async function renumber(ownerId: string, documentId: string) {
  const rows = await db()
    .select({ id: pages.id, position: pages.position })
    .from(pages)
    .where(and(eq(pages.ownerId, ownerId), eq(pages.documentId, documentId)))
    .orderBy(asc(pages.position));
  const updates = rows
    .map((r, i) => ({ ...r, next: i }))
    .filter((r) => r.position !== r.next);
  if (updates.length) {
    const [first, ...rest] = updates.map((r) =>
      db()
        .update(pages)
        .set({ position: r.next })
        .where(ownPage(ownerId, r.id)),
    );
    await db().batch([first!, ...rest]);
  }
  await touchDocument(ownerId, documentId);
}

/** Moves a page one step up (-1) or down (+1). */
export async function movePage(
  ownerId: string,
  pageId: string,
  delta: -1 | 1,
): Promise<Page[]> {
  const ctx = await getPageContext(ownerId, pageId);
  if (!ctx) throw new StoreError("not-found");
  const other = delta < 0 ? ctx.previous : ctx.next;
  if (other) {
    await db().batch([
      db()
        .update(pages)
        .set({ position: other.position })
        .where(ownPage(ownerId, ctx.page.id)),
      db()
        .update(pages)
        .set({ position: ctx.page.position })
        .where(ownPage(ownerId, other.id)),
    ]);
    await touchDocument(ownerId, ctx.page.documentId);
  }
  const doc = await getDocument(ownerId, ctx.page.documentId);
  return doc?.pages ?? [];
}

// ---------------------------------------------------------------------------
// Glossary

export async function listGlossary(ownerId: string): Promise<GlossaryEntry[]> {
  const rows = await db()
    .select()
    .from(glossaryEntries)
    .where(eq(glossaryEntries.ownerId, ownerId))
    .orderBy(asc(glossaryEntries.lang), asc(glossaryEntries.source));
  return rows.map((r) => ({
    id: r.id,
    lang: r.lang as TargetLang,
    source: r.source,
    rendering: r.rendering,
  }));
}

/** Adds or replaces entries (same language + Hebrew term = same entry). */
export async function upsertGlossary(
  ownerId: string,
  entries: Omit<GlossaryEntry, "id">[],
): Promise<GlossaryEntry[]> {
  if (entries.length) {
    // Last one wins within the batch too.
    const unique = new Map(entries.map((e) => [`${e.lang}|${e.source}`, e]));
    await db()
      .insert(glossaryEntries)
      .values([...unique.values()].map((e) => ({ ownerId, ...e })))
      .onConflictDoUpdate({
        target: [
          glossaryEntries.ownerId,
          glossaryEntries.lang,
          glossaryEntries.source,
        ],
        set: { rendering: sql`excluded.rendering` },
      });
  }
  return listGlossary(ownerId);
}

export async function updateGlossaryEntry(
  ownerId: string,
  id: string,
  entry: Omit<GlossaryEntry, "id">,
): Promise<GlossaryEntry[]> {
  await db()
    .update(glossaryEntries)
    .set(entry)
    .where(
      and(eq(glossaryEntries.ownerId, ownerId), eq(glossaryEntries.id, id)),
    );
  return listGlossary(ownerId);
}

export async function deleteGlossaryEntries(
  ownerId: string,
  ids: string[],
): Promise<GlossaryEntry[]> {
  if (ids.length) {
    await db()
      .delete(glossaryEntries)
      .where(
        and(
          eq(glossaryEntries.ownerId, ownerId),
          inArray(glossaryEntries.id, ids),
        ),
      );
  }
  return listGlossary(ownerId);
}

// ---------------------------------------------------------------------------
// Settings

export async function getSettings(ownerId: string): Promise<Settings> {
  const [row] = await db()
    .select()
    .from(userSettings)
    .where(eq(userSettings.ownerId, ownerId));
  return {
    ...DEFAULT_SETTINGS,
    ...row?.settings,
    certification: {
      ...DEFAULT_SETTINGS.certification,
      ...row?.settings.certification,
    },
  };
}

export async function saveSettings(
  ownerId: string,
  settings: Settings,
): Promise<Settings> {
  await db()
    .insert(userSettings)
    .values({ ownerId, settings })
    .onConflictDoUpdate({
      target: userSettings.ownerId,
      set: { settings, updatedAt: new Date() },
    });
  return settings;
}
