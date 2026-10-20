"use client";

/**
 * "Prix": every page that has a prize, sorted by date / page / completion %
 * (either direction, for everyone or one kid), with each kid's status —
 * complete, which cards they still need, and whether the reserve can finish
 * the page for them. Finished deadlines can be hidden, each prize collapsed.
 */

import { useState } from "react";

import {
  cardsOnPage,
  countOf,
  daysUntil,
  missingOnPage,
  rewardCompletion,
  rewardExpired,
  sortRewardsBy,
  tierRanks,
  type Album,
  type Collector,
  type RewardSort,
} from "@/lib/album-logic";

import { Avatar } from "./Avatar";
import { ArrowIcon, CheckIcon, ChevronIcon, GiftIcon } from "./icons";

export type RewardsTexts = {
  search: string;
  hideExpired: string;
  everyone: string;
  person: string;
  sortBy: string;
  sortDate: string;
  sortPage: string;
  sortCompletion: string;
  ascending: string;
  descending: string;
  completion: (pct: number) => string;
  noMatch: string;
  emptyTitle: string;
  emptyBody: string;
  page: (n: number) => string;
  before: (date: string) => string;
  daysLeft: (days: number) => string;
  expired: string;
  firstN: (n: number) => string;
  firstNHint: string;
  tiersTitle: string;
  tiersHint: string;
  rank: (from: number, to: number) => string;
  complete: string;
  reserveCompletes: string;
  missing: (n: number) => string;
  owned: string;
  inReserve: string;
};

export function RewardsTab({
  album,
  kids,
  reserve,
  formatDate,
  t,
}: {
  album: Album;
  kids: Collector[];
  reserve: Collector | undefined;
  formatDate: (isoDate: string) => string;
  t: RewardsTexts;
}) {
  const [sort, setSort] = useState<RewardSort>("date");
  const [desc, setDesc] = useState(false);
  const [search, setSearch] = useState("");
  const [hideExpired, setHideExpired] = useState(false);
  const [person, setPerson] = useState("all");
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());

  // Completion % (shown and sorted on) is for the picked kid, or everyone.
  const forKids =
    sort === "completion" && person !== "all"
      ? kids.filter((k) => k.id === person)
      : kids;
  const sorted = sortRewardsBy(album.rewards, sort, desc, album.cards, forKids);
  // Search a page number ("8") or any prize text, tiers included.
  const query = search.trim().toLowerCase();
  const rewards = sorted.filter(
    (r) =>
      (!hideExpired || !rewardExpired(r)) &&
      (!query ||
        String(r.page) === query ||
        [r.prize, ...(r.tiers ?? []).map((tier) => tier.prize)].some((p) =>
          p.toLowerCase().includes(query),
        )),
  );

  const toggle = (page: number) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (!next.delete(page)) next.add(page);
      return next;
    });

  return (
    <>
      <div className="mb-3.5 flex flex-wrap items-center justify-end gap-2">
        {album.rewards.length > 0 && (
          <>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.search}
              aria-label={t.search}
              className="field-input h-9.5! w-full!"
            />
            <label className="flex items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                checked={hideExpired}
                onChange={(e) => setHideExpired(e.target.checked)}
                className="size-4 accent-accent"
              />
              {t.hideExpired}
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as RewardSort)}
              aria-label={t.sortBy}
              className="field-input ml-auto h-9.5! w-auto!"
            >
              <option value="date">{t.sortDate}</option>
              <option value="page">{t.sortPage}</option>
              <option value="completion">{t.sortCompletion}</option>
            </select>
            {sort === "completion" && (
              <select
                value={person}
                onChange={(e) => setPerson(e.target.value)}
                aria-label={t.person}
                className="field-input h-9.5! w-auto!"
              >
                <option value="all">{t.everyone}</option>
                {kids.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.name}
                  </option>
                ))}
              </select>
            )}
            <button
              type="button"
              onClick={() => setDesc((d) => !d)}
              aria-label={desc ? t.descending : t.ascending}
              title={desc ? t.descending : t.ascending}
              className="field-input flex h-9.5! w-9.5! items-center justify-center px-0!"
            >
              <ArrowIcon
                className={`size-4 transition-transform ${desc ? "rotate-90" : "-rotate-90"}`}
              />
            </button>
          </>
        )}
      </div>
      {album.rewards.length > 0 && !rewards.length && (
        <p className="px-5 py-12 text-center text-muted">{t.noMatch}</p>
      )}
      {!album.rewards.length && (
        <div className="px-5 py-12 text-center text-muted">
          <h3 className="mb-1.5 text-foreground">{t.emptyTitle}</h3>
          <p>{t.emptyBody}</p>
        </div>
      )}
      {rewards.map((r) => {
        const days = r.deadline ? daysUntil(r.deadline) : 0;
        const expired = rewardExpired(r);
        const isCollapsed = collapsed.has(r.page);
        return (
          <div
            key={r.page}
            className={`card mb-3.5 p-4 ${expired ? "opacity-60" : ""}`}
          >
            <div
              role="button"
              tabIndex={0}
              aria-expanded={!isCollapsed}
              onClick={() => toggle(r.page)}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && toggle(r.page)
              }
              className="mb-1 flex cursor-pointer items-start gap-2.5"
            >
              <span className="mt-0.5 text-accent">
                <GiftIcon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-[15px]">
                  {t.page(r.page)} —{" "}
                  {r.kind === "tiers" ? t.tiersTitle : r.prize}
                </h3>
                <p className="text-xs font-semibold text-accent">
                  {t.completion(rewardCompletion(album.cards, r.page, forKids))}
                </p>
                <p className="text-xs text-muted">
                  {r.kind === "deadline" && r.deadline ? (
                    <>
                      {t.before(formatDate(r.deadline))} ·{" "}
                      <span
                        className={
                          expired
                            ? ""
                            : days <= 7
                              ? "font-semibold text-danger"
                              : ""
                        }
                      >
                        {expired ? t.expired : t.daysLeft(days)}
                      </span>
                    </>
                  ) : r.kind === "tiers" ? (
                    t.tiersHint
                  ) : (
                    <>
                      {t.firstN(r.winners ?? 0)} · {t.firstNHint}
                    </>
                  )}
                </p>
                {r.kind === "tiers" && r.tiers && (
                  <ul className="mt-1.5 flex flex-col gap-0.5 text-[13px]">
                    {tierRanks(r.tiers).map((tier) => (
                      <li key={tier.from} className="flex gap-2">
                        <span className="w-16 shrink-0 font-mono text-xs leading-5 text-muted">
                          {t.rank(tier.from, tier.to)}
                        </span>
                        <span>{tier.prize}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <ChevronIcon
                className={`mt-0.5 size-4 shrink-0 text-muted transition-transform ${isCollapsed ? "-rotate-90" : ""}`}
              />
            </div>
            <div className={isCollapsed ? "hidden" : "mt-2.5"}>
              {kids.map((k) => {
                const missing = missingOnPage(album.cards, r.page, k.id);
                // Every card still missing is sitting in the reserve.
                const reserveCompletes =
                  !!reserve &&
                  missing.length > 0 &&
                  !missingOnPage(album.cards, r.page, k.id, reserve.id).length;
                return (
                  <div
                    key={k.id}
                    className="border-t border-line py-2 text-[13.5px] first:border-t-0"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar collector={k} small />
                      <span className="font-medium">{k.name}</span>
                      {missing.length ? (
                        <>
                          <span className="ml-auto text-muted">
                            {t.missing(missing.length)}
                          </span>
                          {reserveCompletes && (
                            <span className="shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent">
                              {t.reserveCompletes}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="ml-auto flex items-center gap-1 font-semibold text-accent">
                          <CheckIcon className="size-3.5" /> {t.complete}
                        </span>
                      )}
                    </div>
                    {missing.length > 0 && (
                      // Every card on the page: owned ones filled, ones the
                      // reserve could give outlined, the rest muted.
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {cardsOnPage(album.cards, r.page).map((c) => {
                          const owned = countOf(c, k.id) > 0;
                          const fromReserve =
                            !owned && !!reserve && countOf(c, reserve.id) > 0;
                          return (
                            <span
                              key={c.id}
                              title={
                                owned
                                  ? t.owned
                                  : fromReserve
                                    ? t.inReserve
                                    : undefined
                              }
                              className={`rounded-md px-1.5 py-0.5 font-mono text-[11.5px] ${
                                owned
                                  ? "bg-accent font-semibold text-accent-ink"
                                  : fromReserve
                                    ? "border border-dashed border-accent text-accent"
                                    : "bg-sunken text-muted"
                              }`}
                            >
                              {c.code}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}
