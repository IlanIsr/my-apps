/**
 * Expense persistence (transactions, categories, merchant → category rules).
 * Server-only; every function is scoped to the given Clerk user id, inputs are
 * already validated (`validate.ts`).
 */

import "server-only";

import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";

import { db } from "@/db/client";
import {
  categories,
  categoryRules,
  receiptItems,
  receipts,
  stores,
  transactions,
} from "@/db/schema";

import {
  DEFAULT_CATEGORIES,
  GROCERIES_KEY,
  merchantKey,
  type Category,
  type CategoryRules,
  type Transaction,
  type TransactionInput,
} from "./expense-logic";
import { StoreError } from "./store-error";

const toCategory = (row: typeof categories.$inferSelect): Category => ({
  id: row.id,
  key: row.key,
  name: row.name,
  icon: row.icon,
  budget: row.budget,
  archived: row.archived,
});

const toTransaction = (row: typeof transactions.$inferSelect): Transaction => ({
  id: row.id,
  date: row.date,
  amount: row.amount,
  categoryId: row.categoryId,
  merchant: row.merchant,
  method: row.method,
  note: row.note,
  receiptId: row.receiptId,
  importKey: row.importKey,
});

// ---------------------------------------------------------------------------
// Categories

/**
 * The user's categories, in order. The first call creates the defaults and
 * turns the grocery receipts saved before transactions existed into
 * transactions.
 */
export async function listCategories(ownerId: string): Promise<Category[]> {
  const rows = await db()
    .select()
    .from(categories)
    .where(eq(categories.ownerId, ownerId))
    .orderBy(asc(categories.position));
  if (rows.length > 0) return rows.map(toCategory);

  await db()
    .insert(categories)
    .values(
      DEFAULT_CATEGORIES.map((c, position) => ({
        ownerId,
        key: c.key,
        icon: c.icon,
        position,
      })),
    );
  const groceries = await groceriesCategoryId(ownerId);
  await backfillReceipts(ownerId, groceries);
  return listCategories(ownerId);
}

/** The "groceries" category (created with the defaults if needed). */
export async function groceriesCategoryId(ownerId: string): Promise<string> {
  const [row] = await db()
    .select({ id: categories.id })
    .from(categories)
    .where(
      and(eq(categories.ownerId, ownerId), eq(categories.key, GROCERIES_KEY)),
    );
  if (row) return row.id;
  const all = await listCategories(ownerId);
  const found = all.find((c) => c.key === GROCERIES_KEY);
  if (found) return found.id;
  // The user deleted it: recreate it at the end.
  const [created] = await db()
    .insert(categories)
    .values({ ownerId, key: GROCERIES_KEY, icon: "🛒", position: all.length })
    .returning({ id: categories.id });
  return created!.id;
}

/** One transaction per receipt that has none yet. */
async function backfillReceipts(ownerId: string, categoryId: string) {
  const totals = await db()
    .select({
      receiptId: receipts.id,
      date: receipts.date,
      method: receipts.method,
      merchant: stores.name,
      amount: sql<string>`coalesce(sum(round(${receiptItems.quantityMilli}::numeric * ${receiptItems.unitPrice} / 1000) - ${receiptItems.discount}), 0)`,
    })
    .from(receipts)
    .innerJoin(stores, eq(stores.id, receipts.storeId))
    .leftJoin(receiptItems, eq(receiptItems.receiptId, receipts.id))
    .leftJoin(transactions, eq(transactions.receiptId, receipts.id))
    .where(and(eq(receipts.ownerId, ownerId), isNull(transactions.id)))
    .groupBy(receipts.id, stores.name);
  if (totals.length === 0) return;
  await db()
    .insert(transactions)
    .values(
      totals.map((r) => ({
        ownerId,
        categoryId,
        receiptId: r.receiptId,
        date: r.date,
        method: r.method,
        merchant: r.merchant,
        amount: Number(r.amount),
      })),
    )
    .onConflictDoNothing();
}

export async function createCategory(
  ownerId: string,
  input: { name: string | null; icon: string; budget: number | null },
): Promise<Category> {
  const all = await listCategories(ownerId);
  const [row] = await db()
    .insert(categories)
    .values({ ownerId, ...input, position: all.length })
    .returning();
  return toCategory(row!);
}

export async function updateCategory(
  ownerId: string,
  id: string,
  input: {
    name: string | null;
    icon: string;
    budget: number | null;
    archived: boolean;
  },
): Promise<Category> {
  const [row] = await db()
    .update(categories)
    .set(input)
    .where(and(eq(categories.ownerId, ownerId), eq(categories.id, id)))
    .returning();
  if (!row) throw new StoreError("not-found");
  return toCategory(row);
}

export async function assertOwnCategory(ownerId: string, id: string | null) {
  if (!id) return;
  const [own] = await db()
    .select({ id: categories.id })
    .from(categories)
    .where(and(eq(categories.ownerId, ownerId), eq(categories.id, id)));
  if (!own) throw new StoreError("not-found");
}

// ---------------------------------------------------------------------------
// Rules

export async function listRules(ownerId: string): Promise<CategoryRules> {
  const rows = await db()
    .select()
    .from(categoryRules)
    .where(eq(categoryRules.ownerId, ownerId));
  return Object.fromEntries(rows.map((r) => [r.merchantKey, r.categoryId]));
}

/** Remember that `merchant` goes in `categoryId`. */
function learn(ownerId: string, merchant: string, categoryId: string) {
  const key = merchantKey(merchant);
  return db()
    .insert(categoryRules)
    .values({ ownerId, merchantKey: key, categoryId })
    .onConflictDoUpdate({
      target: [categoryRules.ownerId, categoryRules.merchantKey],
      set: { categoryId },
    });
}

// ---------------------------------------------------------------------------
// Transactions

export async function listTransactions(
  ownerId: string,
): Promise<Transaction[]> {
  const rows = await db()
    .select()
    .from(transactions)
    .where(eq(transactions.ownerId, ownerId))
    .orderBy(desc(transactions.date), desc(transactions.createdAt));
  return rows.map(toTransaction);
}

export async function createTransaction(
  ownerId: string,
  input: TransactionInput,
): Promise<Transaction> {
  await assertOwnCategory(ownerId, input.categoryId);
  const [row] = await db()
    .insert(transactions)
    .values({ ownerId, ...input })
    .returning();
  if (input.merchant && input.categoryId) {
    await learn(ownerId, input.merchant, input.categoryId);
  }
  return toTransaction(row!);
}

/**
 * A receipt's transaction only takes a new category / note here — its date,
 * amount, merchant and method follow the receipt.
 */
export async function updateTransaction(
  ownerId: string,
  id: string,
  input: TransactionInput,
): Promise<Transaction> {
  await assertOwnCategory(ownerId, input.categoryId);
  const own = and(eq(transactions.ownerId, ownerId), eq(transactions.id, id));
  const [current] = await db().select().from(transactions).where(own);
  if (!current) throw new StoreError("not-found");
  const set = current.receiptId
    ? { categoryId: input.categoryId, note: input.note }
    : input;
  const [row] = await db().update(transactions).set(set).where(own).returning();
  const merchant = row!.merchant;
  if (merchant && input.categoryId) {
    await learn(ownerId, merchant, input.categoryId);
  }
  return toTransaction(row!);
}

/** A receipt's transaction goes away with its receipt, not here. */
export async function deleteTransaction(ownerId: string, id: string) {
  const rows = await db()
    .delete(transactions)
    .where(
      and(
        eq(transactions.ownerId, ownerId),
        eq(transactions.id, id),
        isNull(transactions.receiptId),
      ),
    )
    .returning({ id: transactions.id });
  if (rows.length === 0) throw new StoreError("not-found");
}

/**
 * Card-statement lines. Lines already imported (same `importKey`) are skipped.
 * Returns how many were added.
 */
export async function importTransactions(
  ownerId: string,
  rows: {
    date: string;
    amount: number;
    merchant: string;
    categoryId: string | null;
    importKey: string;
  }[],
): Promise<number> {
  const own = new Set((await listCategories(ownerId)).map((c) => c.id));
  if (rows.some((r) => r.categoryId && !own.has(r.categoryId))) {
    throw new StoreError("not-found");
  }
  const inserted = await db()
    .insert(transactions)
    .values(rows.map((r) => ({ ownerId, method: "card" as const, ...r })))
    .onConflictDoNothing()
    .returning({ id: transactions.id });
  const learned = new Map<string, { merchant: string; categoryId: string }>();
  for (const { merchant, categoryId } of rows) {
    if (categoryId)
      learned.set(merchantKey(merchant), { merchant, categoryId });
  }
  for (const { merchant, categoryId } of learned.values()) {
    await learn(ownerId, merchant, categoryId);
  }
  return inserted.length;
}
