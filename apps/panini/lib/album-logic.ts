/**
 * Client-safe album types + pure helpers (sorting, import parsing, derived
 * stats). No DB access — imported by both the client UI and the server store.
 */

export const COLLECTOR_COLORS = [
  "rose",
  "blue",
  "amber",
  "green",
  "violet",
  "teal",
] as const;
export type CollectorColor = (typeof COLLECTOR_COLORS)[number];
export const RESERVE_COLOR = "slate";

export function isCollectorColor(value: unknown): value is CollectorColor {
  return (
    typeof value === "string" &&
    (COLLECTOR_COLORS as readonly string[]).includes(value)
  );
}

export type Collector = {
  id: string;
  name: string;
  color: string;
  isReserve: boolean;
};

export type Card = {
  id: string;
  code: string;
  page: number;
  label: string;
  /** collectorId → copies owned. Missing key = 0. */
  counts: Record<string, number>;
};

export type RewardKind = "deadline" | "first_n";

export type PageReward = {
  page: number;
  prize: string;
  kind: RewardKind;
  /** `YYYY-MM-DD`, set when `kind === "deadline"`. */
  deadline: string | null;
  /** Number of winners, set when `kind === "first_n"`. */
  winners: number | null;
};

export type Album = {
  name: string;
  cardsPerPage: number;
  /** Kids first (by position), the reserve last. */
  collectors: Collector[];
  cards: Card[];
  rewards: PageReward[];
};

export type ImportEntry = { code: string; page: number; label: string };

export const LIMITS = {
  name: 60,
  code: 20,
  label: 60,
  prize: 120,
  page: 999,
  perPage: 50,
  totalCards: 2000,
  bulkAdd: 500,
  collectors: 12,
  winners: 1_000_000,
} as const;

/** Natural order for mixed codes: 1, 2, 12, 12A, 12B, SP1, SP2, SP10… */
export function naturalCompare(a: string, b: string): number {
  const split = (s: string) =>
    s.match(/\d+|\D+/g)?.map((p) => (/^\d/.test(p) ? Number(p) : p)) ?? [];
  const ax = split(a);
  const bx = split(b);
  for (let i = 0; i < Math.min(ax.length, bx.length); i++) {
    const x = ax[i]!;
    const y = bx[i]!;
    if (typeof x !== typeof y) return typeof x === "number" ? 1 : -1;
    if (x < y) return -1;
    if (x > y) return 1;
  }
  return ax.length - bx.length;
}

export function sortCards(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => naturalCompare(a.code, b.code));
}

/**
 * Parses a pasted list, one card per line: `code`, `code, page` or
 * `code, page, label` (comma / semicolon / tab / space separated). A line
 * `Page N` sets the page for following lines that don't give their own.
 */
export function parseImportText(text: string): ImportEntry[] {
  let lastPage = 1;
  const entries: ImportEntry[] = [];
  for (const line of text.split("\n")) {
    const raw = line.trim();
    if (!raw) continue;
    const pageLine = /^page\s+(\d+)\s*:?$/i.exec(raw);
    if (pageLine) {
      lastPage = Number(pageLine[1]);
      continue;
    }
    const sep = raw.includes("\t")
      ? "\t"
      : raw.includes(";")
        ? ";"
        : raw.includes(",")
          ? ","
          : /\s+/;
    const parts = raw
      .split(sep)
      .map((p) => p.trim())
      .filter(Boolean);
    const [code, second, ...rest] = parts;
    if (!code) continue;
    let page = lastPage;
    let label: string;
    if (second && /^\d+$/.test(second)) {
      page = Number(second);
      lastPage = page;
      label = rest.join(" ");
    } else {
      label = parts.slice(1).join(" ");
    }
    entries.push({ code, page, label });
  }
  return entries;
}

// ---------------- derived ----------------

export const countOf = (card: Card, collectorId: string) =>
  card.counts[collectorId] ?? 0;

export function kidsOf(album: Album): Collector[] {
  return album.collectors.filter((c) => !c.isReserve);
}

export function reserveOf(album: Album): Collector | undefined {
  return album.collectors.find((c) => c.isReserve);
}

export function pagesList(cards: Card[]): number[] {
  return [...new Set(cards.map((c) => c.page))].sort((a, b) => a - b);
}

export function cardsOnPage(cards: Card[], page: number): Card[] {
  return cards.filter((c) => c.page === page);
}

/** Cards on `page` the collector still lacks. */
export function missingOnPage(
  cards: Card[],
  page: number,
  collectorId: string,
): Card[] {
  return cardsOnPage(cards, page).filter((c) => countOf(c, collectorId) === 0);
}

export function pageComplete(
  cards: Card[],
  page: number,
  collectorId: string,
): boolean {
  const onPage = cardsOnPage(cards, page);
  return onPage.length > 0 && onPage.every((c) => countOf(c, collectorId) >= 1);
}

/** For each pair of kids, the duplicates one can give the other. */
export function computeTrades(album: Album) {
  const kids = kidsOf(album);
  const pairs: { a: Collector; b: Collector; aToB: Card[]; bToA: Card[] }[] =
    [];
  const gives = (from: Collector, to: Collector) =>
    sortCards(
      album.cards.filter(
        (c) => countOf(c, from.id) >= 2 && countOf(c, to.id) === 0,
      ),
    );
  kids.forEach((a, i) => {
    for (const b of kids.slice(i + 1)) {
      pairs.push({ a, b, aToB: gives(a, b), bToA: gives(b, a) });
    }
  });
  return pairs;
}

/** Reserve cards each kid is missing, and those every kid already has. */
export function computeReserveGive(album: Album) {
  const reserve = reserveOf(album);
  const kids = kidsOf(album);
  const reserveCards = reserve
    ? sortCards(album.cards.filter((c) => countOf(c, reserve.id) >= 1))
    : [];
  return {
    total: reserveCards.length,
    perKid: kids.map((kid) => ({
      kid,
      items: reserveCards.filter((c) => countOf(c, kid.id) === 0),
    })),
    unclaimed: reserveCards.filter((c) =>
      kids.every((k) => countOf(c, k.id) >= 1),
    ),
  };
}

/** Whole days from today (local) to a `YYYY-MM-DD` date. Negative = past. */
export function daysUntil(isoDate: string, today = new Date()): number {
  const [y, m, d] = isoDate.split("-").map(Number);
  const target = Date.UTC(y!, m! - 1, d!);
  const now = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((target - now) / 86_400_000);
}

/**
 * Rewards in the order worth acting on: open deadlines (soonest first), then
 * "first N" races, then expired deadlines.
 */
export function sortRewards(rewards: PageReward[]): PageReward[] {
  const rank = (r: PageReward) => {
    if (r.kind === "first_n") return [1, r.page];
    const days = daysUntil(r.deadline ?? "");
    return days < 0 ? [2, -days] : [0, days];
  };
  return [...rewards].sort((x, y) => {
    const [a1, a2] = rank(x);
    const [b1, b2] = rank(y);
    return a1! - b1! || a2! - b2!;
  });
}

export function rewardExpired(r: PageReward): boolean {
  return r.kind === "deadline" && daysUntil(r.deadline ?? "") < 0;
}

/** Deadlines by date (earliest first), then "first N" races by page. */
export function sortRewardsByDate(rewards: PageReward[]): PageReward[] {
  return [...rewards].sort(
    (x, y) =>
      (x.deadline ?? "￿").localeCompare(y.deadline ?? "￿") || x.page - y.page,
  );
}

/** Closest to done first: fewest cards still missing across all kids. */
export function sortRewardsByCompletion(
  rewards: PageReward[],
  cards: Card[],
  kids: Collector[],
): PageReward[] {
  const missing = (r: PageReward) =>
    kids.reduce((n, k) => n + missingOnPage(cards, r.page, k.id).length, 0);
  return [...rewards].sort(
    (x, y) => missing(x) - missing(y) || x.page - y.page,
  );
}
