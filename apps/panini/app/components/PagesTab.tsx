/** Every page with its card count and each kid's progress on it. */

import {
  cardsOnPage,
  countOf,
  pageComplete,
  pagesList,
  type Album,
  type Collector,
} from "@/lib/album-logic";

import { PageBadge } from "./CollectionTab";
import { CheckIcon } from "./icons";

export type PagesTexts = {
  empty: string;
  cardsCount: (n: number) => string;
  progress: (name: string, owned: number, total: number) => string;
};

export function PagesTab({
  album,
  kids,
  onOpenPage,
  t,
}: {
  album: Album;
  kids: Collector[];
  onOpenPage: (page: number) => void;
  t: PagesTexts;
}) {
  const pages = pagesList(album.cards);
  if (!pages.length) {
    return <h3 className="py-12 text-center text-muted">{t.empty}</h3>;
  }
  return (
    <div className="card overflow-hidden">
      {pages.map((p) => {
        const onPage = cardsOnPage(album.cards, p);
        return (
          <button
            key={p}
            type="button"
            onClick={() => onOpenPage(p)}
            className="grid w-full grid-cols-[44px_1fr_auto] items-center gap-2.5 border-t border-line px-4 py-2.75 text-left first:border-t-0 hover:bg-sunken"
          >
            <span className="font-mono font-bold">{p}</span>
            <span className="text-xs text-muted">
              {t.cardsCount(onPage.length)}
            </span>
            <span className="flex gap-1.25">
              {kids.map((k) => {
                const done = pageComplete(album.cards, p, k.id);
                const owned = onPage.filter(
                  (c) => countOf(c, k.id) >= 1,
                ).length;
                return (
                  <PageBadge
                    key={k.id}
                    done={done}
                    collector={k}
                    title={t.progress(k.name, owned, onPage.length)}
                  >
                    {done ? <CheckIcon className="size-3" /> : owned}
                  </PageBadge>
                );
              })}
            </span>
          </button>
        );
      })}
    </div>
  );
}
