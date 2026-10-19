/**
 * "Prix": every page that has a prize, most urgent first, with each kid's
 * status — complete, or which cards they still need.
 */

import {
  daysUntil,
  missingOnPage,
  sortRewards,
  type Album,
  type Collector,
  type PageReward,
} from "@/lib/album-logic";

import { Avatar } from "./Avatar";
import { CheckIcon, GiftIcon, PlusIcon } from "./icons";

export type RewardsTexts = {
  add: string;
  emptyTitle: string;
  emptyBody: string;
  page: (n: number) => string;
  before: (date: string) => string;
  daysLeft: (days: number) => string;
  expired: string;
  firstN: (n: number) => string;
  firstNHint: string;
  complete: string;
  missing: (n: number, codes: string) => string;
  edit: string;
};

const MAX_CODES = 8;

export function RewardsTab({
  album,
  kids,
  formatDate,
  onAdd,
  onEdit,
  t,
}: {
  album: Album;
  kids: Collector[];
  formatDate: (isoDate: string) => string;
  onAdd: () => void;
  onEdit: (reward: PageReward) => void;
  t: RewardsTexts;
}) {
  const rewards = sortRewards(album.rewards);

  return (
    <>
      <div className="mb-3.5 flex justify-end">
        <button
          type="button"
          className="btn flex items-center gap-1.5"
          onClick={onAdd}
        >
          <PlusIcon /> {t.add}
        </button>
      </div>
      {!rewards.length && (
        <div className="px-5 py-12 text-center text-muted">
          <h3 className="mb-1.5 text-foreground">{t.emptyTitle}</h3>
          <p>{t.emptyBody}</p>
        </div>
      )}
      {rewards.map((r) => {
        const days = r.deadline ? daysUntil(r.deadline) : 0;
        const expired = r.kind === "deadline" && days < 0;
        return (
          <div
            key={r.page}
            className={`card mb-3.5 p-4 ${expired ? "opacity-60" : ""}`}
          >
            <div className="mb-1 flex items-start gap-2.5">
              <span className="mt-0.5 text-accent">
                <GiftIcon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-[15px]">
                  {t.page(r.page)} — {r.prize}
                </h3>
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
                onClick={() => onEdit(r)}
              >
                {t.edit}
              </button>
            </div>
            <div className="mt-2.5">
              {kids.map((k) => {
                const missing = missingOnPage(album.cards, r.page, k.id);
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
                      <span className="ml-auto truncate text-muted">
                        {t.missing(missing.length, codes)}
                      </span>
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
