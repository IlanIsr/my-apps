/**
 * Drizzle schema for Expenses (Neon project `expenses`).
 *
 * `transactions` is every expense (cash, card, imported statement lines); a
 * grocery receipt also owns one transaction (its total, `receipt_id`).
 *
 * Every row belongs to one Clerk user (`owner_id`); nothing is shared. Money is
 * integer cents, quantities integer milli-units (see `lib/grocery-logic.ts`).
 * A product is identified by its barcode when it has one, else by its name;
 * each receipt line keeps the label as printed on that receipt.
 */

import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import type { DefaultCategoryKey, Method } from "@/lib/expense-logic";
import type { Aisle, ContentUnit, Unit } from "@/lib/grocery-logic";

const ts = (name: string) =>
  timestamp(name, { withTimezone: true, mode: "date" });

export const stores = pgTable(
  "stores",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Clerk user id. */
    ownerId: text("owner_id").notNull(),
    name: text("name").notNull(),
    createdAt: ts("created_at").notNull().defaultNow(),
  },
  (t) => [index("stores_owner_idx").on(t.ownerId)],
);

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id").notNull(),
    name: text("name").notNull(),
    barcode: text("barcode"),
    unit: text("unit").$type<Unit>().notNull().default("unit"),
    /** Its shelf (dairy, produce…), see `AISLES`. */
    aisle: text("aisle").$type<Aisle>(),
    /** What one piece holds (1.5 L = 1500 + "l"), for a price per L / kg. */
    contentMilli: integer("content_milli"),
    contentUnit: text("content_unit").$type<ContentUnit>(),
    createdAt: ts("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("products_owner_idx").on(t.ownerId),
    uniqueIndex("products_owner_barcode_idx")
      .on(t.ownerId, t.barcode)
      .where(sql`${t.barcode} is not null`),
  ],
);

export const receipts = pgTable(
  "receipts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id").notNull(),
    storeId: uuid("store_id")
      .notNull()
      .references(() => stores.id),
    date: date("date", { mode: "string" }).notNull(),
    /** How it was paid — copied onto its transaction. */
    method: text("method").$type<Method>().notNull().default("cash"),
    /** The total printed on the receipt (cents), to check the sum against. */
    declaredTotal: integer("declared_total"),
    note: text("note"),
    createdAt: ts("created_at").notNull().defaultNow(),
    updatedAt: ts("updated_at").notNull().defaultNow(),
  },
  (t) => [index("receipts_owner_idx").on(t.ownerId, t.date)],
);

export const receiptItems = pgTable(
  "receipt_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    receiptId: uuid("receipt_id")
      .notNull()
      .references(() => receipts.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    position: integer("position").notNull(),
    /** As printed on this receipt. */
    label: text("label").notNull(),
    quantityMilli: integer("quantity_milli").notNull(),
    /** Per piece or per kg, cents. */
    unitPrice: integer("unit_price").notNull(),
    discount: integer("discount").notNull().default(0),
  },
  (t) => [
    index("receipt_items_receipt_idx").on(t.receiptId),
    index("receipt_items_product_idx").on(t.productId),
  ],
);

/** The current shopping list (one row per product). */
export const shoppingItems = pgTable(
  "shopping_items",
  {
    ownerId: text("owner_id").notNull(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    quantityMilli: integer("quantity_milli").notNull(),
  },
  (t) => [primaryKey({ columns: [t.ownerId, t.productId] })],
);

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id").notNull(),
    /** A default category's key (translated in the UI), else `null`. */
    key: text("key").$type<DefaultCategoryKey>(),
    /** Custom name; `null` = the translated default. */
    name: text("name"),
    icon: text("icon").notNull(),
    position: integer("position").notNull(),
    /** Monthly budget in cents. */
    budget: integer("budget"),
    archived: boolean("archived").notNull().default(false),
  },
  (t) => [index("categories_owner_idx").on(t.ownerId)],
);

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id").notNull(),
    date: date("date", { mode: "string" }).notNull(),
    /** Cents. */
    amount: integer("amount").notNull(),
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    merchant: text("merchant"),
    method: text("method").$type<Method>().notNull().default("cash"),
    note: text("note"),
    /** The grocery receipt this is the total of. */
    receiptId: uuid("receipt_id").references(() => receipts.id, {
      onDelete: "cascade",
    }),
    /** Statement-import dedup key (see `importKeys`). */
    importKey: text("import_key"),
    /** Bought by the litre (fuel…): litres × 1000 and the price per litre. */
    litersMilli: integer("liters_milli"),
    pricePerLiter: integer("price_per_liter"),
    createdAt: ts("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("transactions_owner_idx").on(t.ownerId, t.date),
    uniqueIndex("transactions_receipt_idx")
      .on(t.receiptId)
      .where(sql`${t.receiptId} is not null`),
    uniqueIndex("transactions_import_idx")
      .on(t.ownerId, t.importKey)
      .where(sql`${t.importKey} is not null`),
  ],
);

/** What the user filed a merchant under — suggests the category next time. */
export const categoryRules = pgTable(
  "category_rules",
  {
    ownerId: text("owner_id").notNull(),
    merchantKey: text("merchant_key").notNull(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.ownerId, t.merchantKey] })],
);

/**
 * Two products the user said are NOT the same (Duplicates page) — never
 * suggested again. `product_a` < `product_b`.
 */
export const productDistinctPairs = pgTable(
  "product_distinct_pairs",
  {
    ownerId: text("owner_id").notNull(),
    productA: uuid("product_a")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    productB: uuid("product_b")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.ownerId, t.productA, t.productB] })],
);
