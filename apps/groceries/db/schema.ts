/**
 * Drizzle schema for Groceries (Neon project `groceries`).
 *
 * Every row belongs to one Clerk user (`owner_id`); nothing is shared. Money is
 * integer cents, quantities integer milli-units (see `lib/grocery-logic.ts`).
 * A product is identified by its barcode when it has one, else by its name;
 * each receipt line keeps the label as printed on that receipt.
 */

import { sql } from "drizzle-orm";
import {
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

import type { Unit } from "@/lib/grocery-logic";

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
