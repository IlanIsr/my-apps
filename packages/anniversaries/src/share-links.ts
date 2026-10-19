/**
 * Persistence for share links — Neon / Postgres via Drizzle. Server-only,
 * same conventions as `store.ts` (which it reuses `runBatch`/`BatchStmt`
 * from). No calendar, auth, or i18n here.
 */

import { eq } from "drizzle-orm";

import { db, DatabaseNotConfiguredError } from "./db/client";
import { shareLinkPersons, shareLinks } from "./db/schema";
import { isStoreConfigured, runBatch, type BatchStmt } from "./store";

export type ShareLinkRecord = {
  id: string;
  createdBy: string;
  expiresAt: Date;
  personIds: string[];
};

export async function createShareLink(input: {
  createdBy: string;
  personIds: string[];
  expiresAt: Date;
}): Promise<{ id: string }> {
  if (!isStoreConfigured()) throw new DatabaseNotConfiguredError();

  const id = crypto.randomUUID();
  const stmts: BatchStmt[] = [
    db().insert(shareLinks).values({
      id,
      createdBy: input.createdBy,
      expiresAt: input.expiresAt,
    }),
    db()
      .insert(shareLinkPersons)
      .values(input.personIds.map((personId) => ({ shareLinkId: id, personId }))),
  ];
  await runBatch(stmts);
  return { id };
}

export async function getShareLink(
  id: string,
): Promise<ShareLinkRecord | null> {
  if (!isStoreConfigured()) throw new DatabaseNotConfiguredError();

  const [linkRows, personRows] = await Promise.all([
    db().select().from(shareLinks).where(eq(shareLinks.id, id)),
    db()
      .select()
      .from(shareLinkPersons)
      .where(eq(shareLinkPersons.shareLinkId, id)),
  ]);
  const link = linkRows[0];
  if (!link) return null;

  return {
    id: link.id,
    createdBy: link.createdBy,
    expiresAt: link.expiresAt,
    personIds: personRows.map((r) => r.personId),
  };
}
