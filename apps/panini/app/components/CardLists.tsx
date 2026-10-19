/** "Échanges" and "Réserve" tabs: who can give which card to whom. */

import {
  computeReserveGive,
  computeTrades,
  countOf,
  type Album,
  type Card,
  type Collector,
} from "@/lib/album-logic";

import { Avatar } from "./Avatar";
import { ArrowIcon } from "./icons";

export type CardListsTexts = {
  gives: (from: string, to: string) => string;
  nothingToTrade: string;
  noKidsPairs: string;
  page: (n: number) => string;
  inReserve: (n: number) => string;
  reserveEmptyTitle: string;
  reserveEmptyBody: string;
  toGive: (n: number) => string;
  nothingForKid: (name: string) => string;
  leftover: string;
  leftoverHint: string;
  cardsCount: (n: number) => string;
};

function CardItem({ card, tag }: { card: Card; tag: string }) {
  return (
    <div className="flex items-baseline gap-2 border-t border-line py-1.75 text-[13.5px] first:border-t-0">
      <span className="font-mono font-bold">{card.code}</span>
      {card.label && <span>{card.label}</span>}
      <span className="ml-auto text-[11.5px] text-muted">{tag}</span>
    </div>
  );
}

const Empty = ({ title, body }: { title: string; body?: string }) => (
  <div className="px-5 py-12 text-center text-muted">
    <h3 className="mb-1.5 text-foreground">{title}</h3>
    {body && <p>{body}</p>}
  </div>
);

export function TradesTab({ album, t }: { album: Album; t: CardListsTexts }) {
  const pairs = computeTrades(album);
  if (!pairs.length) return <Empty title={t.noKidsPairs} />;

  const column = (from: Collector, to: Collector, list: Card[]) => (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-[12.5px] font-bold tracking-wide text-muted uppercase">
        <ArrowIcon className="size-3.25" /> {t.gives(from.name, to.name)}
      </div>
      {list.length ? (
        list.map((c) => <CardItem key={c.id} card={c} tag={t.page(c.page)} />)
      ) : (
        <p className="py-1 text-[13px] text-muted italic">{t.nothingToTrade}</p>
      )}
    </div>
  );

  return pairs.map(({ a, b, aToB, bToA }) => (
    <div key={`${a.id}-${b.id}`} className="card mb-3.5 p-4">
      <div className="mb-3 flex items-center gap-2 text-[15px]">
        <Avatar collector={a} small /> {a.name}
        <ArrowIcon className="size-3.5 text-muted" />
        {b.name} <Avatar collector={b} small />
      </div>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        {column(a, b, aToB)}
        {column(b, a, bToA)}
      </div>
    </div>
  ));
}

export function ReserveTab({
  album,
  reserve,
  t,
}: {
  album: Album;
  reserve?: Collector;
  t: CardListsTexts;
}) {
  const data = computeReserveGive(album);
  if (!reserve || !data.total) {
    return <Empty title={t.reserveEmptyTitle} body={t.reserveEmptyBody} />;
  }
  const tag = (c: Card) =>
    `${t.page(c.page)} · ${t.inReserve(countOf(c, reserve.id))}`;

  return (
    <>
      {data.perKid.map(({ kid, items }) => (
        <div key={kid.id} className="card mb-3.5 p-4">
          <div className="mb-3 flex items-center gap-2 text-[15px]">
            <Avatar collector={kid} small /> {kid.name}
            <span className="ml-auto text-xs font-semibold text-muted">
              {t.toGive(items.length)}
            </span>
          </div>
          {items.length ? (
            items.map((c) => <CardItem key={c.id} card={c} tag={tag(c)} />)
          ) : (
            <p className="py-1 text-[13px] text-muted italic">
              {t.nothingForKid(kid.name)}
            </p>
          )}
        </div>
      ))}
      {data.unclaimed.length > 0 && (
        <div className="card mb-3.5 p-4">
          <div className="mb-3 flex items-center text-[15px] text-muted">
            {t.leftover}
            <span className="ml-auto text-xs font-semibold">
              {t.cardsCount(data.unclaimed.length)}
            </span>
          </div>
          <p className="mb-2.5 text-xs text-muted">{t.leftoverHint}</p>
          {data.unclaimed.map((c) => (
            <CardItem key={c.id} card={c} tag={tag(c)} />
          ))}
        </div>
      )}
    </>
  );
}
