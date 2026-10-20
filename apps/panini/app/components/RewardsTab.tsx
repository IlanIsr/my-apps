"use client";

/**
 * "Prix": every page that has a prize, sorted by date / page / completion %
 * (either direction, for everyone or one kid), with each kid's status —
 * complete, which cards they still need, and whether the reserve can finish
 * the page for them. Finished deadlines can be hidden, each prize collapsed.
 */

import { useState } from "react";

import {
  daysUntil,
  missingOnPage,
  rewardCompletion,
  rewardExpired,
  sortRewardsBy,
  type Album,
  type Collector,
  type PageReward,
  type RewardSort,
} from "@/lib/album-logic";

import { Avatar } from "./Avatar";
import { ArrowIcon, CheckIcon, ChevronIcon, GiftIcon, PlusIcon } from "./icons";

export type RewardsTexts = {
  add: string;
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
  complete: string;
  reserveCompletes: string;
  missing: (n: number, codes: string) => string;
  edit: string;
};

const MAX_CODES = 8;

export function RewardsTab({
  album,
  kids,
  reserve,
  formatDate,
  onAdd,
  onEdit,
  t,
}: {
  album: Album;
  kids: Collector[];
  reserve: Collector | undefined;
  formatDate: (isoDate: string) => string;
  onAdd: () => void;
  onEdit: (reward: PageReward) => void;
  t: RewardsTexts;
}) {
  const [sort, setSort] = useState<RewardSort>("date");
  const [desc, setDesc] = useState(false);
  const [hideExpired, setHideExpired] = useState(false);
  const [person, setPerson] = useState("all");
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());

  // Completion % (shown and sorted on) is for the picked kid, or everyone.
  const forKids =
    sort === "completion" && person !== "all"
      ? kids.filter((k) => k.id === person)
      : kids;
  const sorted = sortRewardsBy(album.rewards, sort, desc, album.cards, forKids);
  const rewards = hideExpired
    ? sorted.filter((r) => !rewardExpired(r))
    : sorted;

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
        <button
          type="button"
          className="btn flex items-center gap-1.5"
          onClick={onAdd}
        >
          <PlusIcon /> {t.add}
        </button>
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
                  {t.page(r.page)} — {r.prize}
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
                  ) : (
                    <>
                      {t.firstN(r.winners ?? 0)} · {t.firstNHint}
                    </>
                  )}
                </p>
              </div>
              <button
                type="button"
                className="text-sm font-semibold text-accent"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(r);
                }}
              >
                {t.edit}
              </button>
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
                const codes =
                  missing
                    .slice(0, MAX_CODES)
                    .map((c) => c.code)
                    .join(", ") + (missing.length > MAX_CODES ? "…" : "");
                return (
                  <div
                    key={k.id}
                    className="flex items-center gap-2 border-t border-line py-1.75 text-[13.5px] first:border-t-0"
                  >
                    <Avatar collector={k} small />
                    <span className="font-medium">{k.name}</span>
                    {missing.length ? (
                      <>
                        <span className="ml-auto truncate text-muted">
                          {t.missing(missing.length, codes)}
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
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}
