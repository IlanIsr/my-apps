/**
 * Expenses persistence (Neon / Drizzle). Server-only. Every function takes the
 * signed-in Clerk user id and scopes every query to it, so one user can never
 * reach another's rows. Inputs are assumed already validated (`validate.ts`).
 */

import "server-only";

import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";

import { db } from "@/db/client";
import {
  productDistinctPairs,
  products,
  receiptItems,
  receipts,
  shoppingItems,
  stores,
  transactions,
} from "@/db/schema";

import { autoRepay } from "./expense-logic";
import {
  assertOwnCategory,
  groceriesCategoryId,
  isCashEnvelope,
} from "./expense-store";
import { StoreError } from "./store-error";

import {
  normalizeName,
  pairKey,
  payable,
  priceWithDeposit,
  receiptTotal,
  type LineInput,
  type PricePoint,
  type Product,
  type ProductInput,
  type Receipt,
  type ReceiptInput,
  type ReceiptSummary,
  type ShoppingItem,
  type Store,
} from "./grocery-logic";

export { StoreError, type StoreErrorCode } from "./store-error";

const toProduct = (row: typeof products.$inferSelect): Product => ({
  id: row.id,
  name: row.name,
  barcode: row.barcode,
  unit: row.unit,
  aisle: row.aisle,
  contentMilli: row.contentMilli,
  contentUnit: row.contentUnit,
});

/** `round(quantity × unit price) − discount + deposit`, as in `lineTotal`. */
const LINE_TOTAL = sql<number>`(round(${receiptItems.quantityMilli}::numeric * ${receiptItems.unitPrice} / 1000) - ${receiptItems.discount} + ${receiptItems.deposit})`;

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

/**
 * A product added by hand (no purchase yet). A barcode already used is an
 * error; without one, a product of the same name is returned instead of a
 * duplicate.
 */
export async function createProduct(
  ownerId: string,
  input: ProductInput,
): Promise<Product> {
  const all = await listProducts(ownerId);
  if (input.barcode && all.some((p) => p.barcode === input.barcode)) {
    throw new StoreError("barcode-taken");
  }
  if (!input.barcode) {
    const key = normalizeName(input.name);
    const same = all.find((p) => normalizeName(p.name) === key);
    if (same) return same;
  }
  const [row] = await db()
    .insert(products)
    .values({ ownerId, ...input })
    .returning();
  return toProduct(row!);
}

export async function updateProduct(
  ownerId: string,
  id: string,
  input: ProductInput,
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

/** The pairs declared "not the same product", as `pairKey`s. */
export async function listDistinctPairs(ownerId: string): Promise<string[]> {
  const rows = await db()
    .select()
    .from(productDistinctPairs)
    .where(eq(productDistinctPairs.ownerId, ownerId));
  return rows.map((r) => pairKey(r.productA, r.productB));
}

async function assertOwnProducts(ownerId: string, ids: string[]) {
  const rows = await db()
    .select({ id: products.id })
    .from(products)
    .where(and(eq(products.ownerId, ownerId), inArray(products.id, ids)));
  if (rows.length !== new Set(ids).size) throw new StoreError("not-found");
}

/** "These two are different products" — never suggested again. */
export async function markDistinct(ownerId: string, a: string, b: string) {
  await assertOwnProducts(ownerId, [a, b]);
  const [productA, productB] = a < b ? [a, b] : [b, a];
  await db()
    .insert(productDistinctPairs)
    .values({ ownerId, productA, productB })
    .onConflictDoNothing();
}

/**
 * Merges `drop` into `keep`: every receipt line and the shopping list move to
 * `keep`, which takes the chosen name / barcode (and `drop`'s shelf / content
 * where it has none); `drop` is deleted. One transaction.
 */
export async function mergeProducts(
  ownerId: string,
  keep: string,
  drop: string,
  input: { name: string; barcode: string | null },
): Promise<void> {
  if (keep === drop) throw new StoreError("not-found");
  const rows = await db()
    .select()
    .from(products)
    .where(
      and(eq(products.ownerId, ownerId), inArray(products.id, [keep, drop])),
    );
  const kept = rows.find((r) => r.id === keep);
  const dropped = rows.find((r) => r.id === drop);
  if (!kept || !dropped) throw new StoreError("not-found");
  if (input.barcode) {
    const [taken] = await db()
      .select({ id: products.id })
      .from(products)
      .where(
        and(eq(products.ownerId, ownerId), eq(products.barcode, input.barcode)),
      );
    if (taken && taken.id !== keep && taken.id !== drop) {
      throw new StoreError("barcode-taken");
    }
  }
  await db().batch([
    db()
      .update(receiptItems)
      .set({ productId: keep })
      .where(eq(receiptItems.productId, drop)),
    // Both in the shopping list: keep the larger quantity.
    db().execute(sql`
      insert into ${shoppingItems} (owner_id, product_id, quantity_milli)
      select owner_id, ${keep}, quantity_milli from ${shoppingItems}
      where owner_id = ${ownerId} and product_id = ${drop}
      on conflict (owner_id, product_id) do update
      set quantity_milli = greatest(${shoppingItems.quantityMilli}, excluded.quantity_milli)
    `),
    db().delete(products).where(eq(products.id, drop)),
    db()
      .update(products)
      .set({
        name: input.name,
        barcode: input.barcode,
        aisle: kept.aisle ?? dropped.aisle,
        contentMilli: kept.contentMilli ?? dropped.contentMilli,
        contentUnit: kept.contentMilli ? kept.contentUnit : dropped.contentUnit,
      })
      .where(eq(products.id, keep)),
  ]);
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
      deposit: receiptItems.deposit,
      paid: LINE_TOTAL,
    })
    .from(receiptItems)
    .innerJoin(receipts, eq(receipts.id, receiptItems.receiptId))
    .where(eq(receipts.ownerId, ownerId))
    .orderBy(asc(receipts.date));
  // A product's price is its listed one plus its deposit (paid every time):
  // a discount is a bonus of that purchase, not the product's price (it only
  // lowers what was `paid`).
  return rows.map(({ deposit, ...row }) => ({
    ...row,
    paid: Number(row.paid),
    unitPrice: priceWithDeposit({ ...row, deposit }),
  }));
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
      method: receipts.method,
      fromFriend: receipts.fromFriend,
      total: sql<string>`coalesce(sum(${LINE_TOTAL}), 0)`,
      lineCount: sql<number>`count(${receiptItems.id})::int`,
    })
    .from(receipts)
    .innerJoin(stores, eq(stores.id, receipts.storeId))
    .leftJoin(receiptItems, eq(receiptItems.receiptId, receipts.id))
    .where(eq(receipts.ownerId, ownerId))
    .groupBy(receipts.id, stores.name)
    .orderBy(desc(receipts.date), desc(receipts.createdAt));
  // The total paid (cash rounded to 10 agorot).
  return rows.map((row) => ({
    ...row,
    total: payable(Number(row.total), row.method),
  }));
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
      categoryId: transactions.categoryId,
      fromFriend: receipts.fromFriend,
    })
    .from(receipts)
    .innerJoin(stores, eq(stores.id, receipts.storeId))
    .leftJoin(transactions, eq(transactions.receiptId, receipts.id))
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
      deposit: receiptItems.deposit,
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
  await assertOwnCategory(ownerId, input.categoryId);
  const categoryId = input.categoryId ?? (await groceriesCategoryId(ownerId));
  // Paid by card from a cash budget: that cash goes back to the account.
  const toRepay = autoRepay(input.method, {
    cashEnvelope: await isCashEnvelope(ownerId, categoryId),
  });
  const receiptId = id ?? crypto.randomUUID();
  const fields = {
    storeId,
    date: input.date,
    declaredTotal: input.declaredTotal,
    note: input.note,
    method: input.method,
    fromFriend: input.fromFriend,
  };
  // The receipt's total as an expense (same transaction as the receipt).
  const expense = {
    date: input.date,
    amount: payable(receiptTotal(input.lines), input.method),
    merchant: input.storeName,
    method: input.method,
    categoryId,
    toRepay,
  };
  const syncExpense = input.fromFriend
    ? // A friend's receipt is not an expense (it may have been one before).
      db().delete(transactions).where(eq(transactions.receiptId, receiptId))
    : db()
        .insert(transactions)
        .values({ ownerId, receiptId, ...expense })
        .onConflictDoUpdate({
          target: transactions.receiptId,
          targetWhere: sql`${transactions.receiptId} is not null`,
          // No longer owing cash back forgets when it was put back.
          set: toRepay ? expense : { ...expense, repaidOn: null },
        });
  const items = input.lines.map((line, position) => ({
    receiptId,
    productId: productIds[position]!,
    position,
    label: line.label,
    quantityMilli: line.quantityMilli,
    unitPrice: line.unitPrice,
    discount: line.discount,
    deposit: line.deposit,
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
