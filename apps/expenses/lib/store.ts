/**
 * Expenses persistence (Neon / Drizzle). Server-only. Every function takes the
 * signed-in Clerk user id and scopes every query to it, so one user can never
 * reach another's rows. Inputs are assumed already validated (`validate.ts`).
 */

import "server-only";

import { and, asc, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db/client";
import {
  products,
  receiptItems,
  receipts,
  shoppingItems,
  stores,
  transactions,
} from "@/db/schema";

import { groceriesCategoryId } from "./expense-store";
import { StoreError } from "./store-error";

import {
  normalizeName,
  receiptTotal,
  type LineInput,
  type PricePoint,
  type Product,
  type Receipt,
  type ReceiptInput,
  type ReceiptSummary,
  type ShoppingItem,
  type Store,
  type Unit,
} from "./grocery-logic";

export { StoreError, type StoreErrorCode } from "./store-error";

const toProduct = (row: typeof products.$inferSelect): Product => ({
  id: row.id,
  name: row.name,
  barcode: row.barcode,
  unit: row.unit,
});

/** `round(quantity × unit price) − discount`, as in `lineTotal`. */
const LINE_TOTAL = sql<number>`(round(${receiptItems.quantityMilli}::numeric * ${receiptItems.unitPrice} / 1000) - ${receiptItems.discount})`;

// ---------------------------------------------------------------------------
// Stores

export async function listStores(ownerId: string): Promise<Store[]> {
  return db()
    .select({ id: stores.id, name: stores.name })
    .from(stores)
    .where(eq(stores.ownerId, ownerId))
    .orderBy(asc(stores.name));
}

export async function renameStore(ownerId: string, id: string, name: string) {
  const rows = await db()
    .update(stores)
    .set({ name })
    .where(and(eq(stores.ownerId, ownerId), eq(stores.id, id)))
    .returning({ id: stores.id });
  if (rows.length === 0) throw new StoreError("not-found");
}

async function resolveStore(ownerId: string, name: string): Promise<string> {
  const key = normalizeName(name);
  const existing = (await listStores(ownerId)).find(
    (s) => normalizeName(s.name) === key,
  );
  if (existing) return existing.id;
  const [row] = await db()
    .insert(stores)
    .values({ ownerId, name })
    .returning({ id: stores.id });
  return row!.id;
}

// ---------------------------------------------------------------------------
// Products

export async function listProducts(ownerId: string): Promise<Product[]> {
  const rows = await db()
    .select()
    .from(products)
    .where(eq(products.ownerId, ownerId))
    .orderBy(asc(products.name));
  return rows.map(toProduct);
}

export async function updateProduct(
  ownerId: string,
  id: string,
  input: { name: string; barcode: string | null; unit: Unit },
): Promise<Product> {
  if (input.barcode) {
    const [taken] = await db()
      .select({ id: products.id })
      .from(products)
      .where(
        and(eq(products.ownerId, ownerId), eq(products.barcode, input.barcode)),
      );
    if (taken && taken.id !== id) throw new StoreError("barcode-taken");
  }
  const [row] = await db()
    .update(products)
    .set(input)
    .where(and(eq(products.ownerId, ownerId), eq(products.id, id)))
    .returning();
  if (!row) throw new StoreError("not-found");
  return toProduct(row);
}

/**
 * The product id of each line: by barcode when it has one, else by name;
 * created when nothing matches. A known product keeps its own name.
 */
async function resolveProducts(
  ownerId: string,
  lines: LineInput[],
): Promise<string[]> {
  const all = await listProducts(ownerId);
  const byBarcode = new Map(
    all.filter((p) => p.barcode).map((p) => [p.barcode!, p.id]),
  );
  const byName = new Map(all.map((p) => [normalizeName(p.name), p.id]));

  const ids: string[] = [];
  for (const line of lines) {
    const key = normalizeName(line.label);
    let id = line.barcode ? byBarcode.get(line.barcode) : byName.get(key);
    if (!id) {
      const [row] = await db()
        .insert(products)
        .values({
          ownerId,
          name: line.label,
          barcode: line.barcode,
          unit: line.unit,
        })
        .returning({ id: products.id });
      id = row!.id;
      if (line.barcode) byBarcode.set(line.barcode, id);
      if (!byName.has(key)) byName.set(key, id);
    }
    ids.push(id);
  }
  return ids;
}

/** Every purchase line of the user, oldest first. */
export async function listPricePoints(ownerId: string): Promise<PricePoint[]> {
  const rows = await db()
    .select({
      productId: receiptItems.productId,
      storeId: receipts.storeId,
      receiptId: receipts.id,
      date: receipts.date,
      quantityMilli: receiptItems.quantityMilli,
      listedPrice: receiptItems.unitPrice,
      paid: LINE_TOTAL,
    })
    .from(receiptItems)
    .innerJoin(receipts, eq(receipts.id, receiptItems.receiptId))
    .where(eq(receipts.ownerId, ownerId))
    .orderBy(asc(receipts.date));
  return rows.map((row) => {
    const paid = Number(row.paid);
    return {
      ...row,
      paid,
      unitPrice: Math.round((paid * 1000) / row.quantityMilli),
    };
  });
}

// ---------------------------------------------------------------------------
// Receipts

export async function listReceipts(ownerId: string): Promise<ReceiptSummary[]> {
  const rows = await db()
    .select({
      id: receipts.id,
      storeId: receipts.storeId,
      storeName: stores.name,
      date: receipts.date,
      declaredTotal: receipts.declaredTotal,
      total: sql<string>`coalesce(sum(${LINE_TOTAL}), 0)`,
      lineCount: sql<number>`count(${receiptItems.id})::int`,
    })
    .from(receipts)
    .innerJoin(stores, eq(stores.id, receipts.storeId))
    .leftJoin(receiptItems, eq(receiptItems.receiptId, receipts.id))
    .where(eq(receipts.ownerId, ownerId))
    .groupBy(receipts.id, stores.name)
    .orderBy(desc(receipts.date), desc(receipts.createdAt));
  return rows.map((row) => ({ ...row, total: Number(row.total) }));
}

export async function getReceipt(
  ownerId: string,
  id: string,
): Promise<Receipt | null> {
  const [row] = await db()
    .select({
      id: receipts.id,
      storeId: receipts.storeId,
      storeName: stores.name,
      date: receipts.date,
      declaredTotal: receipts.declaredTotal,
      note: receipts.note,
      method: receipts.method,
    })
    .from(receipts)
    .innerJoin(stores, eq(stores.id, receipts.storeId))
    .where(and(eq(receipts.ownerId, ownerId), eq(receipts.id, id)));
  if (!row) return null;
  const lines = await db()
    .select({
      productId: receiptItems.productId,
      barcode: products.barcode,
      label: receiptItems.label,
      unit: products.unit,
      quantityMilli: receiptItems.quantityMilli,
      unitPrice: receiptItems.unitPrice,
      discount: receiptItems.discount,
    })
    .from(receiptItems)
    .innerJoin(products, eq(products.id, receiptItems.productId))
    .where(eq(receiptItems.receiptId, id))
    .orderBy(asc(receiptItems.position));
  return { ...row, lines };
}

/** Creates (`id = null`) or replaces a receipt. Returns its id. */
export async function saveReceipt(
  ownerId: string,
  id: string | null,
  input: ReceiptInput,
): Promise<string> {
  if (id) {
    const [own] = await db()
      .select({ id: receipts.id })
      .from(receipts)
      .where(and(eq(receipts.ownerId, ownerId), eq(receipts.id, id)));
    if (!own) throw new StoreError("not-found");
  }
  const storeId = await resolveStore(ownerId, input.storeName);
  const productIds = await resolveProducts(ownerId, input.lines);
  const categoryId = await groceriesCategoryId(ownerId);
  const receiptId = id ?? crypto.randomUUID();
  const fields = {
    storeId,
    date: input.date,
    declaredTotal: input.declaredTotal,
    note: input.note,
    method: input.method,
  };
  // The receipt's total as an expense (same transaction as the receipt).
  const expense = {
    date: input.date,
    amount: receiptTotal(input.lines),
    merchant: input.storeName,
    method: input.method,
  };
  const syncExpense = db()
    .insert(transactions)
    .values({ ownerId, receiptId, categoryId, ...expense })
    .onConflictDoUpdate({
      target: transactions.receiptId,
      targetWhere: sql`${transactions.receiptId} is not null`,
      set: expense,
    });
  const items = input.lines.map((line, position) => ({
    receiptId,
    productId: productIds[position]!,
    position,
    label: line.label,
    quantityMilli: line.quantityMilli,
    unitPrice: line.unitPrice,
    discount: line.discount,
  }));

  const head = id
    ? db()
        .update(receipts)
        .set({ ...fields, updatedAt: new Date() })
        .where(eq(receipts.id, id))
    : db()
        .insert(receipts)
        .values({ id: receiptId, ownerId, ...fields });
  const clear = db()
    .delete(receiptItems)
    .where(eq(receiptItems.receiptId, receiptId));
  // One transaction: the receipt, its lines and its expense change together.
  if (items.length > 0) {
    await db().batch([
      head,
      clear,
      db().insert(receiptItems).values(items),
      syncExpense,
    ]);
  } else {
    await db().batch([head, clear, syncExpense]);
  }
  return receiptId;
}

export async function deleteReceipt(ownerId: string, id: string) {
  const rows = await db()
    .delete(receipts)
    .where(and(eq(receipts.ownerId, ownerId), eq(receipts.id, id)))
    .returning({ id: receipts.id });
  if (rows.length === 0) throw new StoreError("not-found");
}

// ---------------------------------------------------------------------------
// Shopping list

export async function listShopping(ownerId: string): Promise<ShoppingItem[]> {
  return db()
    .select({
      productId: shoppingItems.productId,
      quantityMilli: shoppingItems.quantityMilli,
    })
    .from(shoppingItems)
    .where(eq(shoppingItems.ownerId, ownerId));
}

/** `quantityMilli = 0` removes the item. */
export async function setShoppingItem(
  ownerId: string,
  productId: string,
  quantityMilli: number,
) {
  if (quantityMilli === 0) {
    await db()
      .delete(shoppingItems)
      .where(
        and(
          eq(shoppingItems.ownerId, ownerId),
          eq(shoppingItems.productId, productId),
        ),
      );
    return;
  }
  const [own] = await db()
    .select({ id: products.id })
    .from(products)
    .where(and(eq(products.ownerId, ownerId), eq(products.id, productId)));
  if (!own) throw new StoreError("not-found");
  await db()
    .insert(shoppingItems)
    .values({ ownerId, productId, quantityMilli })
    .onConflictDoUpdate({
      target: [shoppingItems.ownerId, shoppingItems.productId],
      set: { quantityMilli },
    });
}

export async function clearShopping(ownerId: string) {
  await db().delete(shoppingItems).where(eq(shoppingItems.ownerId, ownerId));
}
