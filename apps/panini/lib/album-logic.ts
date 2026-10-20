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

export type RewardKind = "deadline" | "first_n" | "tiers";

/** One step of a ranking: the next `winners` people to finish win `prize`. */
export type RewardTier = { winners: number; prize: string };

export type PageReward = {
  page: number;
  prize: string;
  kind: RewardKind;
  /** `YYYY-MM-DD`, set when `kind === "deadline"`. */
  deadline: string | null;
  /** Number of winners, set when `kind === "first_n"`. */
  winners: number | null;
  /** The ranking, in finishing order, set when `kind === "tiers"`. */
  tiers: RewardTier[] | null;
};

export type Album = {
  name: string;
  /** Kids first (by position), the reserve last. */
  collectors: Collector[];
  cards: Card[];
  rewards: PageReward[];
};

export const LIMITS = {
  name: 60,
  prize: 120,
  page: 999,
  collectors: 12,
  winners: 1_000_000,
  tiers: 10,
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

/**
 * Cards on `page` the collector still lacks. With `reserveId`, a card the
 * reserve holds counts as covered.
 */
export function missingOnPage(
  cards: Card[],
  page: number,
  collectorId: string,
  reserveId?: string,
): Card[] {
  return cardsOnPage(cards, page).filter(
    (c) =>
      countOf(c, collectorId) === 0 &&
      (!reserveId || countOf(c, reserveId) === 0),
  );
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

/** Each tier's finishing positions: 1–1, 2–3, 4–6… */
export function tierRanks(
  tiers: RewardTier[],
): { from: number; to: number; prize: string }[] {
  let next = 1;
  return tiers.map((t) => {
    const from = next;
    next += t.winners;
    return { from, to: next - 1, prize: t.prize };
  });
}

export function rewardExpired(r: PageReward): boolean {
  return r.kind === "deadline" && daysUntil(r.deadline ?? "") < 0;
}

export type RewardSort = "date" | "page" | "completion";

/** Share of a page's cards the given kids own, all together (0–100). */
export function rewardCompletion(
  cards: Card[],
  page: number,
  kids: Collector[],
): number {
  const total = cardsOnPage(cards, page).length * kids.length;
  if (!total) return 0;
  const missing = kids.reduce(
    (n, k) => n + missingOnPage(cards, page, k.id).length,
    0,
  );
  return Math.round(((total - missing) / total) * 100);
}

/**
 * Rewards sorted by deadline, page number or completion %. "First N" races
 * have no date, so the date sort always puts them last whatever the direction.
 */
export function sortRewardsBy(
  rewards: PageReward[],
  by: RewardSort,
  desc: boolean,
  cards: Card[],
  kids: Collector[],
): PageReward[] {
  const sign = desc ? -1 : 1;
  const key = (r: PageReward) =>
    by === "completion" ? rewardCompletion(cards, r.page, kids) : r.page;
  return [...rewards].sort((x, y) => {
    if (by === "date") {
      if (!x.deadline || !y.deadline)
        return (x.deadline ? -1 : y.deadline ? 1 : 0) || x.page - y.page;
      return sign * x.deadline.localeCompare(y.deadline) || x.page - y.page;
    }
    return sign * (key(x) - key(y)) || x.page - y.page;
  });
}
