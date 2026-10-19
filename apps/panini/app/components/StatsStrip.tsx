/** One card per kid: cards owned, progress bar, duplicates, complete pages. */

import {
  countOf,
  pageComplete,
  pagesList,
  type Card,
  type Collector,
} from "@/lib/album-logic";
import { collectorStyle } from "@/lib/colors";

import { Avatar } from "./Avatar";

export type StatsTexts = {
  ofCards: (total: number) => string;
  duplicates: (n: number) => string;
  pages: (done: number, total: number) => string;
};

export function StatsStrip({
  kids,
  cards,
  t,
}: {
  kids: Collector[];
  cards: Card[];
  t: StatsTexts;
}) {
  const pages = pagesList(cards);
  return (
    <div className="mb-5.5 grid grid-cols-1 gap-2.5 sm:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
      {kids.map((kid) => {
        const owned = cards.filter((c) => countOf(c, kid.id) >= 1).length;
        const dups = cards.filter((c) => countOf(c, kid.id) >= 2).length;
        const done = pages.filter((p) => pageComplete(cards, p, kid.id)).length;
        const pct = cards.length ? Math.round((owned / cards.length) * 100) : 0;
        return (
          <div
            key={kid.id}
            className="card px-4 py-3.5"
            style={collectorStyle(kid.color)}
          >
            <div className="mb-2.5 flex items-center gap-2">
              <Avatar collector={kid} />
              <span className="text-sm font-semibold">{kid.name}</span>
            </div>
            <div className="font-mono text-[22px] font-bold">
              {owned}
              <small className="text-[13px] font-medium text-muted">
                {" "}
                {t.ofCards(cards.length)}
              </small>
            </div>
            <div className="my-2 h-1.5 overflow-hidden rounded bg-sunken">
              <div
                className="h-full rounded bg-kc"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted">
              <span>{t.duplicates(dups)}</span>
              <span>{t.pages(done, pages.length)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
