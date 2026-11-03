/**
 * Client-safe types + pure helpers for expenses (transactions, categories,
 * budgets, statement import). Money is integer cents, like `grocery-logic.ts`.
 */

import { normalizeName } from "./grocery-logic";

export const METHODS = ["cash", "card", "cibus"] as const;
export type Method = (typeof METHODS)[number];

export const METHOD_ICON: Record<Method, string> = {
  cash: "💵",
  card: "💳",
  cibus: "🍽️",
};

/**
 * The starting categories, created for every new user. `key` lets the UI
 * translate them until the user renames one (then `name` wins).
 */
export const DEFAULT_CATEGORIES = [
  { key: "groceries", icon: "🛒" },
  { key: "restaurant", icon: "🍽️" },
  { key: "transport", icon: "🚌" },
  { key: "housing", icon: "🏠" },
  { key: "health", icon: "💊" },
  { key: "clothing", icon: "👕" },
  { key: "leisure", icon: "🎉" },
  { key: "subscriptions", icon: "🔁" },
  { key: "other", icon: "📦" },
] as const;
export type DefaultCategoryKey = (typeof DEFAULT_CATEGORIES)[number]["key"];

/** The category a grocery receipt's transaction goes to. */
export const GROCERIES_KEY: DefaultCategoryKey = "groceries";

export const EXPENSE_LIMITS = {
  merchant: 80,
  note: 300,
  categoryName: 40,
  icon: 8,
  categories: 50,
  importRows: 2000,
  items: 30,
  itemLabel: 60,
} as const;

export type Category = {
  id: string;
  key: DefaultCategoryKey | null;
  /** Custom name; `null` = the translated default for `key`. */
  name: string | null;
  icon: string;
  /** Monthly budget in cents, or `null`. */
  budget: number | null;
  archived: boolean;
};

export type Transaction = {
  id: string;
  /** `YYYY-MM-DD`. */
  date: string;
  /** Cents, > 0 for an expense. */
  amount: number;
  categoryId: string | null;
  merchant: string | null;
  method: Method;
  note: string | null;
  /** Set when the transaction is a grocery receipt's total. */
  receiptId: string | null;
  /** Set when it came from a statement import (dedup key). */
  importKey: string | null;
  /** Bought by the litre (fuel…): litres × 1000, price per litre (cents). */
  litersMilli: number | null;
  pricePerLiter: number | null;
  /** Split into lines (restaurant: dish, bread, drink…), or `null`. */
  items: ExpenseItem[] | null;
};

/** One line of a split expense: just detail, the category stays the expense's. */
export type ExpenseItem = {
  label: string;
  /** Cents, > 0. */
  amount: number;
};

export type TransactionInput = {
  date: string;
  /**
   * With litres, always `litersAmount(litersMilli, pricePerLiter)`; with
   * items, their sum — both rounded to 10 agorot when paid in cash.
   */
  amount: number;
  categoryId: string | null;
  merchant: string | null;
  method: Method;
  note: string | null;
  litersMilli: number | null;
  pricePerLiter: number | null;
  items: ExpenseItem[] | null;
};

/** Litres × price per litre, in cents. */
export const litersAmount = (litersMilli: number, pricePerLiter: number) =>
  Math.round((litersMilli * pricePerLiter) / 1000);

/** A split expense's lines, summed (cents). */
export const itemsAmount = (items: ExpenseItem[]) =>
  items.reduce((sum, item) => sum + item.amount, 0);

/** `merchant key → category id`, learned from what the user picked. */
export type CategoryRules = Record<string, string>;

export function merchantKey(merchant: string): string {
  return normalizeName(merchant)
    .replace(/[^\p{L}\p{N} ]/gu, "")
    .trim();
}

export function categoryLabel(
  category: Pick<Category, "key" | "name">,
  defaults: Record<DefaultCategoryKey, string>,
): string {
  return category.name ?? (category.key ? defaults[category.key] : "?");
}

// ---------------------------------------------------------------------------
// Months

/** `YYYY-MM` of a `YYYY-MM-DD`. */
export const monthOf = (date: string) => date.slice(0, 7);

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number) as [number, number];
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function formatMonth(month: string, tag: string): string {
  return new Date(`${month}-15T12:00:00`).toLocaleDateString(tag, {
    month: "long",
    year: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Summaries

export type MonthSummary = {
  total: number;
  byCategory: Map<string | null, number>;
  byMethod: Record<Method, number>;
};

export function summarize(transactions: Transaction[]): MonthSummary {
  const byCategory = new Map<string | null, number>();
  const byMethod: Record<Method, number> = { cash: 0, card: 0, cibus: 0 };
  let total = 0;
  for (const t of transactions) {
    total += t.amount;
    byMethod[t.method] += t.amount;
    byCategory.set(
      t.categoryId,
      (byCategory.get(t.categoryId) ?? 0) + t.amount,
    );
  }
  return { total, byCategory, byMethod };
}

/** Totals for the `count` months ending at `last`, oldest first. */
export function monthlyTotals(
  transactions: Transaction[],
  last: string,
  count: number,
) {
  const totals = new Map<string, number>();
  for (const t of transactions) {
    const m = monthOf(t.date);
    totals.set(m, (totals.get(m) ?? 0) + t.amount);
  }
  return Array.from({ length: count }, (_, i) => {
    const month = shiftMonth(last, i - count + 1);
    return { month, total: totals.get(month) ?? 0 };
  });
}

/**
 * Where `spent` ends the month at the same pace — only for the current
 * month (`null` otherwise, or before anything was spent).
 */
export function projectMonth(
  spent: number,
  month: string,
  day: string,
): number | null {
  if (monthOf(day) !== month || spent <= 0) return null;
  const [y, m] = month.split("-").map(Number) as [number, number];
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return Math.round((spent / Number(day.slice(8, 10))) * days);
}

export type BudgetState = "ok" | "near" | "over";

/** ≥ 80 % = near, > 100 % = over. */
export function budgetState(spent: number, budget: number): BudgetState {
  if (spent > budget) return "over";
  if (spent >= budget * 0.8) return "near";
  return "ok";
}

// ---------------------------------------------------------------------------
// Statement import

export type ImportRow = {
  date: string;
  amount: number;
  merchant: string;
};

/**
 * A stable key per statement line, so a re-import skips what's already in:
 * date + amount + merchant + its rank among identical lines of the file.
 */
export function importKeys(rows: ImportRow[]): string[] {
  const seen = new Map<string, number>();
  return rows.map((row) => {
    const base = `${row.date}|${row.amount}|${merchantKey(row.merchant)}`;
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    return `${base}|${n}`;
  });
}

/** `dd/mm/yyyy`, `dd/mm/yy`, `dd.mm.yyyy`, `yyyy-mm-dd` or a Date → `YYYY-MM-DD`. */
export function parseStatementDate(value: unknown): string | null {
  const pad = (n: number) => String(n).padStart(2, "0");
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
  }
  if (typeof value !== "string") return null;
  const text = value.trim();
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(text);
  if (m) return `${m[1]}-${pad(Number(m[2]))}-${pad(Number(m[3]))}`;
  m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})$/.exec(text);
  if (!m) return null;
  const year = m[3]!.length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
  const month = Number(m[2]);
  const day = Number(m[1]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** `"1,234.50"` / `"₪ 12.90"` / `-45` → cents (absolute value), or `null`. */
export function parseStatementAmount(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(Math.abs(value) * 100);
  }
  if (typeof value !== "string") return null;
  let text = value.replace(/[^\d.,-]/g, "");
  if (!/\d/.test(text)) return null;
  // "1.234,50" (comma decimal) vs "1,234.50" (dot decimal).
  if (/,\d{1,2}$/.test(text)) text = text.replace(/\./g, "").replace(",", ".");
  else text = text.replace(/,/g, "");
  const n = Number(text);
  return Number.isFinite(n) ? Math.round(Math.abs(n) * 100) : null;
}

/** Header names (lowercased, partial) that usually mean each column. */
export const COLUMN_HINTS = {
  date: ["תאריך עסקה", "תאריך", "date"],
  merchant: [
    "שם בית העסק",
    "בית עסק",
    "שם בית עסק",
    "merchant",
    "description",
    "libellé",
    "commerçant",
  ],
  amount: [
    "סכום חיוב",
    "סכום לחיוב",
    "סכום",
    "amount",
    "montant",
    "debit",
    "débit",
  ],
} as const;

export function guessColumn(
  headers: string[],
  field: keyof typeof COLUMN_HINTS,
): number {
  const lower = headers.map((h) => h.toLowerCase().trim());
  for (const hint of COLUMN_HINTS[field]) {
    const i = lower.findIndex((h) => h.includes(hint));
    if (i !== -1) return i;
  }
  return -1;
}

/** The existing transaction an imported line probably duplicates. */
export function findMatch(
  row: ImportRow,
  existing: Transaction[],
): Transaction | null {
  return (
    existing.find(
      (t) => t.date === row.date && Math.abs(t.amount - row.amount) <= 1,
    ) ?? null
  );
}

/** A CSV file → rows of cells (quotes, `,` / `;` / tab, detected). */
export function parseCsv(text: string): string[][] {
  const clean = text.replace(/^\uFEFF/, "");
  const firstLine = clean.split(/\r?\n/, 1)[0] ?? "";
  const delimiter = [",", ";", "\t"].reduce((best, d) =>
    firstLine.split(d).length > firstLine.split(best).length ? d : best,
  );
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i]!;
    if (quoted) {
      if (ch === '"' && clean[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === delimiter) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && clean[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim()));
}

/**
 * Statements often start with a few title lines: the header row is the first
 * one naming both a date and an amount column (else the first row).
 */
export function findHeaderRow(rows: unknown[][]): number {
  const i = rows.findIndex((row) => {
    const headers = row.map((c) => (typeof c === "string" ? c : ""));
    return (
      guessColumn(headers, "date") !== -1 &&
      guessColumn(headers, "amount") !== -1
    );
  });
  return Math.max(0, i);
}

// ---------------------------------------------------------------------------
// Goals

/** What a goal caps: all spending, one category, or one payment method. */
export const GOAL_SCOPES = ["total", "category", "method"] as const;
export type GoalScope = (typeof GOAL_SCOPES)[number];

export type Goal = {
  id: string;
  /** `YYYY-MM`. */
  month: string;
  scope: GoalScope;
  categoryId: string | null;
  method: Method | null;
  /** The most to spend, cents. */
  amount: number;
  name: string | null;
};

export type GoalInput = Omit<Goal, "id">;

export type GoalProgress = {
  spent: number;
  /** Negative once over. */
  remaining: number;
  /** What can still be spent per day, today included (current month only). */
  perDay: number | null;
  /** Days left in the month, today included (current month only). */
  daysLeft: number | null;
  /** Month-end spending at the current pace (current month only). */
  projection: number | null;
  state: BudgetState;
};

/** The transactions a goal counts. */
export function goalMatches(goal: Goal, t: Transaction): boolean {
  if (monthOf(t.date) !== goal.month) return false;
  if (goal.scope === "category") return t.categoryId === goal.categoryId;
  if (goal.scope === "method") return t.method === goal.method;
  return true;
}

export function goalProgress(
  goal: Goal,
  transactions: Transaction[],
  day: string,
): GoalProgress {
  const spent = transactions
    .filter((t) => goalMatches(goal, t))
    .reduce((s, t) => s + t.amount, 0);
  const remaining = goal.amount - spent;
  const current = monthOf(day) === goal.month;
  const [y, m] = goal.month.split("-").map(Number) as [number, number];
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const daysLeft = current ? days - Number(day.slice(8, 10)) + 1 : null;
  return {
    spent,
    remaining,
    daysLeft,
    perDay:
      daysLeft === null ? null : Math.max(0, Math.floor(remaining / daysLeft)),
    projection: current ? projectMonth(spent, goal.month, day) : null,
    state: budgetState(spent, goal.amount),
  };
}
