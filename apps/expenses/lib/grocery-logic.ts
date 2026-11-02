/**
 * Client-safe types + pure helpers for Groceries (no DB, no server code).
 *
 * Money is integer **cents** (agorot) everywhere; quantities are integer
 * **milli-units** (1 piece = 1000, 452 g of a per-kg product = 452), so no
 * float ever reaches the database. A line's total is
 * `round(quantity × unitPrice) − discount`.
 */

import type { Method } from "./expense-logic";

/** Display currency — one constant, change it here. */
export const CURRENCY = "ILS";

/** `"unit"` = sold by the piece, `"kg"` = weighed (price per kg). */
export const UNITS = ["unit", "kg"] as const;
export type Unit = (typeof UNITS)[number];

export const LIMITS = {
  lines: 300,
  label: 120,
  barcode: 32,
  note: 500,
  storeName: 60,
  /** 10 000 pieces / kg. */
  quantityMilli: 10_000_000,
  cents: 100_000_000,
  shoppingItems: 300,
} as const;

/** A product's shelf — a fixed list for now. */
export const AISLES = [
  "produce",
  "dairy",
  "meat",
  "fish",
  "bakery",
  "pantry",
  "frozen",
  "snacks",
  "drinks",
  "hygiene",
  "cleaning",
  "household",
  "other",
] as const;
export type Aisle = (typeof AISLES)[number];

export const AISLE_ICON: Record<Aisle, string> = {
  produce: "🥦",
  dairy: "🥛",
  meat: "🥩",
  fish: "🐟",
  bakery: "🥖",
  pantry: "🥫",
  frozen: "🧊",
  snacks: "🍫",
  drinks: "🥤",
  hygiene: "🧴",
  cleaning: "🧽",
  household: "🧻",
  other: "📦",
};

/** A piece's content: litres or kilos. */
export const CONTENT_UNITS = ["l", "kg"] as const;
export type ContentUnit = (typeof CONTENT_UNITS)[number];

export type Store = { id: string; name: string };

export type Product = {
  id: string;
  name: string;
  barcode: string | null;
  unit: Unit;
  aisle: Aisle | null;
  /** What one piece holds, milli-units of `contentUnit` (1.5 L = 1500). */
  contentMilli: number | null;
  contentUnit: ContentUnit | null;
};

export type ProductInput = Pick<
  Product,
  "name" | "barcode" | "unit" | "aisle" | "contentMilli" | "contentUnit"
>;

/**
 * Price per L / kg (cents): a per-kg product's price as is, a per-piece one
 * divided by its content; `null` when unknown.
 */
export function pricePerMeasure(
  product: Pick<Product, "unit" | "contentMilli" | "contentUnit">,
  unitPrice: number,
): { price: number; unit: ContentUnit } | null {
  if (product.unit === "kg") return { price: unitPrice, unit: "kg" };
  if (!product.contentMilli || !product.contentUnit) return null;
  return {
    price: Math.round((unitPrice * 1000) / product.contentMilli),
    unit: product.contentUnit,
  };
}

/** A line as typed in the form / sent to the server. */
export type LineInput = {
  barcode: string | null;
  /** The label as printed on the receipt. */
  label: string;
  unit: Unit;
  quantityMilli: number;
  /** Per piece, or per kg. */
  unitPrice: number;
  discount: number;
};

export type ReceiptInput = {
  storeName: string;
  /** `YYYY-MM-DD`. */
  date: string;
  /** The total printed on the receipt, to check against. */
  declaredTotal: number | null;
  note: string | null;
  /** How it was paid — copied onto its transaction. */
  method: Method;
  /** Its transaction's category; `null` = groceries. */
  categoryId: string | null;
  lines: LineInput[];
};

export type ReceiptLine = LineInput & { productId: string };

export type Receipt = {
  id: string;
  storeId: string;
  storeName: string;
  date: string;
  declaredTotal: number | null;
  note: string | null;
  method: Method;
  categoryId: string | null;
  lines: ReceiptLine[];
};

export type ReceiptSummary = {
  id: string;
  storeId: string;
  storeName: string;
  date: string;
  declaredTotal: number | null;
  total: number;
  lineCount: number;
};

/** One purchase of a product: what it cost per unit (after discount). */
export type PricePoint = {
  productId: string;
  storeId: string;
  receiptId: string;
  date: string;
  quantityMilli: number;
  /** Effective price per piece / kg, in cents (discount included). */
  unitPrice: number;
  /** The price per piece / kg printed on the line. */
  listedPrice: number;
  /** What was paid for the line. */
  paid: number;
};

export type ShoppingItem = { productId: string; quantityMilli: number };

// ---------------------------------------------------------------------------
// Totals

export function lineTotal(line: {
  quantityMilli: number;
  unitPrice: number;
  discount: number;
}): number {
  return (
    Math.round((line.quantityMilli * line.unitPrice) / 1000) - line.discount
  );
}

export function receiptTotal(lines: Parameters<typeof lineTotal>[0][]): number {
  return lines.reduce((sum, line) => sum + lineTotal(line), 0);
}

/** Effective price per piece / kg, discount included. */
export function effectiveUnitPrice(line: Parameters<typeof lineTotal>[0]) {
  if (line.quantityMilli <= 0) return line.unitPrice;
  return Math.round((lineTotal(line) * 1000) / line.quantityMilli);
}

// ---------------------------------------------------------------------------
// Parsing / formatting

/** `"12,90"` / `"12.9"` / `"12"` → 1290; `null` when not a number ≥ 0. */
export function parseMoney(text: string): number | null {
  const n = parseDecimal(text);
  return n === null ? null : Math.round(n * 100);
}

/** `"0,452"` → 452 (milli-units); `null` when not a number > 0. */
export function parseQuantity(text: string): number | null {
  const n = parseDecimal(text);
  if (n === null) return null;
  const milli = Math.round(n * 1000);
  return milli > 0 ? milli : null;
}

function parseDecimal(text: string): number | null {
  const cleaned = text.trim().replace(/\s/g, "").replace(",", ".");
  if (!/^\d+(\.\d*)?$|^\.\d+$/.test(cleaned)) return null;
  return Number(cleaned);
}

/** 1290 → `"12,90"` (form fields, no currency sign). */
export function centsToInput(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}

/** 452 → `"0,452"`, 2000 → `"2"`. */
export function quantityToInput(milli: number): string {
  return String(milli / 1000).replace(".", ",");
}

export function formatMoney(cents: number, tag: string): string {
  return new Intl.NumberFormat(tag, {
    style: "currency",
    currency: CURRENCY,
  }).format(cents / 100);
}

export function formatQuantity(milli: number, unit: Unit, tag: string) {
  const n = new Intl.NumberFormat(tag, { maximumFractionDigits: 3 }).format(
    milli / 1000,
  );
  return unit === "kg" ? `${n} kg` : `× ${n}`;
}

export function formatDay(date: string, tag: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString(tag, {
    dateStyle: "medium",
  });
}

export function today(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Case / accent / spacing-insensitive key for matching names. */
export function normalizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

// ---------------------------------------------------------------------------
// Prices

/** The most recent price point per store, for one product. */
export function latestByStore(points: PricePoint[]): Map<string, PricePoint> {
  const latest = new Map<string, PricePoint>();
  for (const point of points) {
    const current = latest.get(point.storeId);
    if (!current || point.date > current.date) latest.set(point.storeId, point);
  }
  return latest;
}

/** `productId → storeId → latest point`. */
export function latestPrices(
  points: PricePoint[],
): Map<string, Map<string, PricePoint>> {
  const byProduct = new Map<string, PricePoint[]>();
  for (const point of points) {
    const list = byProduct.get(point.productId) ?? [];
    list.push(point);
    byProduct.set(point.productId, list);
  }
  return new Map(
    [...byProduct].map(([productId, list]) => [productId, latestByStore(list)]),
  );
}

/** The cheapest latest point across stores, or `null`. */
export function cheapest(
  byStore: Map<string, PricePoint> | undefined,
): PricePoint | null {
  let best: PricePoint | null = null;
  for (const point of byStore?.values() ?? []) {
    if (!best || point.unitPrice < best.unitPrice) best = point;
  }
  return best;
}

// ---------------------------------------------------------------------------
// Shopping list

export type StoreQuote = {
  storeId: string;
  /** Sum over the items this store has a price for. */
  total: number;
  /** Items with no known price at this store. */
  missing: string[];
};

export type ShoppingPlan = {
  /** Every store, complete ones first, then by total. */
  quotes: StoreQuote[];
  /** Each item at its cheapest store. */
  split: { productId: string; storeId: string; cost: number }[];
  splitTotal: number;
  /** Items with no known price anywhere. */
  unpriced: string[];
};

export function planShopping(
  items: ShoppingItem[],
  stores: Store[],
  prices: Map<string, Map<string, PricePoint>>,
): ShoppingPlan {
  const cost = (point: PricePoint, item: ShoppingItem) =>
    Math.round((point.unitPrice * item.quantityMilli) / 1000);

  const quotes = stores.map((store): StoreQuote => {
    let total = 0;
    const missing: string[] = [];
    for (const item of items) {
      const point = prices.get(item.productId)?.get(store.id);
      if (point) total += cost(point, item);
      else missing.push(item.productId);
    }
    return { storeId: store.id, total, missing };
  });
  quotes.sort(
    (a, b) => a.missing.length - b.missing.length || a.total - b.total,
  );

  const split: ShoppingPlan["split"] = [];
  const unpriced: string[] = [];
  for (const item of items) {
    const best = cheapest(prices.get(item.productId));
    if (best) {
      split.push({
        productId: item.productId,
        storeId: best.storeId,
        cost: cost(best, item),
      });
    } else unpriced.push(item.productId);
  }
  const splitTotal = split.reduce((sum, s) => sum + s.cost, 0);
  return { quotes, split, splitTotal, unpriced };
}

// ---------------------------------------------------------------------------
// Spending

/** `YYYY-MM` → total spent, most recent first. */
export function spendingByMonth(receipts: ReceiptSummary[]) {
  const months = new Map<string, number>();
  for (const r of receipts) {
    const month = r.date.slice(0, 7);
    months.set(month, (months.get(month) ?? 0) + r.total);
  }
  return [...months]
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([month, total]) => ({ month, total }));
}

export function spendingByStore(receipts: ReceiptSummary[]) {
  const stores = new Map<string, { total: number; count: number }>();
  for (const r of receipts) {
    const entry = stores.get(r.storeId) ?? { total: 0, count: 0 };
    entry.total += r.total;
    entry.count += 1;
    stores.set(r.storeId, entry);
  }
  return [...stores]
    .map(([storeId, entry]) => ({ storeId, ...entry }))
    .sort((a, b) => b.total - a.total);
}

export function spendingByProduct(points: PricePoint[]) {
  const products = new Map<string, number>();
  for (const p of points) {
    products.set(p.productId, (products.get(p.productId) ?? 0) + p.paid);
  }
  return [...products]
    .map(([productId, total]) => ({ productId, total }))
    .sort((a, b) => b.total - a.total);
}

/** What was paid per shelf (`null` = not set), biggest first. */
export function spendingByAisle(points: PricePoint[], products: Product[]) {
  const aisle = new Map(products.map((p) => [p.id, p.aisle]));
  const totals = new Map<Aisle | null, number>();
  for (const p of points) {
    const key = aisle.get(p.productId) ?? null;
    totals.set(key, (totals.get(key) ?? 0) + p.paid);
  }
  return [...totals]
    .map(([aisle, total]) => ({ aisle, total }))
    .sort((a, b) => b.total - a.total);
}

/**
 * Per product × store: first vs latest price paid, biggest rise first. Only
 * pairs bought at least twice.
 */
export function priceChanges(points: PricePoint[]) {
  const pairs = new Map<string, { first: PricePoint; last: PricePoint }>();
  for (const p of points) {
    const key = `${p.productId}|${p.storeId}`;
    const entry = pairs.get(key);
    if (!entry) pairs.set(key, { first: p, last: p });
    else {
      if (p.date < entry.first.date) entry.first = p;
      if (p.date >= entry.last.date) entry.last = p;
    }
  }
  return [...pairs.values()]
    .filter(({ first, last }) => first !== last && first.unitPrice > 0)
    .map(({ first, last }) => ({
      productId: last.productId,
      storeId: last.storeId,
      from: first.unitPrice,
      to: last.unitPrice,
      pct: Math.round(
        ((last.unitPrice - first.unitPrice) / first.unitPrice) * 100,
      ),
    }))
    .sort((a, b) => b.pct - a.pct);
}

// ---------------------------------------------------------------------------
// Duplicates

/** `"a|b"` with a < b — the key of an unordered pair of product ids. */
export const pairKey = (a: string, b: string) =>
  a < b ? `${a}|${b}` : `${b}|${a}`;

const tokens = (name: string) =>
  new Set(
    normalizeName(name)
      .replace(/[^\p{L}\p{N} ]/gu, " ")
      .split(" ")
      .filter(Boolean),
  );

/** Edit distance, for short names. */
function distance(a: string, b: string): number {
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(
        prev[j]! + 1,
        row[j - 1]! + 1,
        prev[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = row;
  }
  return prev[b.length]!;
}

/** 0..1 — how alike two product names look. */
export function nameSimilarity(a: string, b: string): number {
  const x = normalizeName(a);
  const y = normalizeName(b);
  if (!x || !y) return 0;
  if (x === y) return 1;
  const ta = tokens(a);
  const tb = tokens(b);
  const common = [...ta].filter((t) => tb.has(t)).length;
  const jaccard = common / (ta.size + tb.size - common || 1);
  // "lait 1l" inside "lait tnuva 1l": every word of the shorter one is in the other.
  const contained = common / (Math.min(ta.size, tb.size) || 1);
  const edit = 1 - distance(x, y) / Math.max(x.length, y.length);
  return Math.max(jaccard, edit, contained === 1 ? 0.75 : 0);
}

export type DuplicateSuggestion = { a: Product; b: Product; score: number };

/**
 * Pairs of products that may be the same one (alike names), best first,
 * minus the pairs already declared distinct. Two different barcodes with
 * different names are never suggested.
 */
export function duplicateSuggestions(
  products: Product[],
  distinct: Set<string>,
  threshold = 0.7,
): DuplicateSuggestion[] {
  const out: DuplicateSuggestion[] = [];
  for (let i = 0; i < products.length; i++) {
    for (let j = i + 1; j < products.length; j++) {
      const a = products[i]!;
      const b = products[j]!;
      if (distinct.has(pairKey(a.id, b.id))) continue;
      const score = nameSimilarity(a.name, b.name);
      if (score >= threshold) out.push({ a, b, score });
    }
  }
  return out.sort((x, y) => y.score - x.score);
}
