"use client";

/**
 * The album, page by page: search / page / kid / status filters, a +/− stepper
 * per collector on every card, completion badges and the page's prize (if any).
 * Picking a kid narrows everything to them: only their stepper and badge, and
 * the status filter (defaulting to "their cards") is about them.
 */

import {
  cardsOnPage,
  countOf,
  pageComplete,
  pagesList,
  type Album,
  type Card,
  type Collector,
} from "@/lib/album-logic";
import { collectorStyle } from "@/lib/colors";

import { Button } from "./Button";
import { CheckIcon, ChevronIcon } from "./icons";
import { Select } from "./Select";
import { TextInput } from "./TextInput";

export type CollectionTexts = {
  search: string;
  allPages: string;
  page: (n: number) => string;
  all: string;
  allKids: string;
  ownedBy: (name: string) => string;
  missingFor: (name: string) => string;
  duplicatesOf: (name: string) => string;
  inReserve: string;
  pageComplete: (name: string) => string;
  pageIncomplete: (name: string) => string;
  addOne: (name: string) => string;
  removeOne: (name: string) => string;
  noMatchTitle: string;
  noMatchBody: string;
  noKidsTitle: string;
  noKidsBody: string;
};

export type CollectionFilters = {
  search: string;
  page: number | "all";
  /** A kid's collector id, or `all`. */
  kid: string;
  /** `all`, `reserve`, `owned:<id>`, `missing:<id>` or `dup:<id>`. */
  status: string;
};

function matches(card: Card, f: CollectionFilters, reserve?: Collector) {
  if (f.page !== "all" && card.page !== f.page) return false;
  if (f.search) {
    const hay = `${card.code} ${card.label}`.toLowerCase();
    if (!hay.includes(f.search.toLowerCase())) return false;
  }
  if (f.status === "all") return true;
  if (f.status === "reserve")
    return !!reserve && countOf(card, reserve.id) >= 1;
  const [kind, id = ""] = f.status.split(":");
  const n = countOf(card, id);
  return kind === "owned" ? n >= 1 : kind === "missing" ? n === 0 : n >= 2;
}

function Stepper({
  card,
  collector,
  onStep,
  t,
}: {
  card: Card;
  collector: Collector;
  onStep: (card: Card, collector: Collector, delta: 1 | -1) => void;
  t: CollectionTexts;
}) {
  const v = countOf(card, collector.id);
  const tone =
    v === 0
      ? "border-line bg-sunken opacity-55"
      : v === 1
        ? "border-kc bg-kc-soft text-kc"
        : "border-kc bg-kc text-white";
  const btn = `size-6.5 min-w-0 rounded-none bg-transparent px-0 text-[15px] leading-none ${
    v >= 2
      ? "text-white/80 hover:text-white"
      : "text-muted hover:text-foreground"
  }`;
  return (
    <div
      title={collector.name}
      style={collectorStyle(collector.color)}
      className={`flex items-center overflow-hidden rounded-full border-[1.5px] ${tone}`}
    >
      <Button
        variant="ghost"
        size="sm"
        isIconOnly
        className={btn}
        aria-label={t.removeOne(collector.name)}
        onClick={() => onStep(card, collector, -1)}
      >
        −
      </Button>
      <span className="min-w-4.5 px-0.5 text-center font-mono text-[13px] font-bold">
        {v}
      </span>
      <Button
        variant="ghost"
        size="sm"
        isIconOnly
        className={btn}
        aria-label={t.addOne(collector.name)}
        onClick={() => onStep(card, collector, 1)}
      >
        +
      </Button>
    </div>
  );
}

export function PageBadge({
  done,
  collector,
  title,
  children,
}: {
  done: boolean;
  collector: Collector;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <span
      title={title}
      style={collectorStyle(collector.color)}
      className={`flex size-5.5 flex-none items-center justify-center rounded-full text-[10.5px] font-bold ${
        done
          ? "bg-kc text-white"
          : "border-[1.5px] border-line-strong bg-surface text-muted"
      }`}
    >
      {children}
    </span>
  );
}

export function CollectionTab({
  album,
  kids,
  reserve,
  filters,
  onFilters,
  collapsed,
  onToggle,
  onStep,
  t,
}: {
  album: Album;
  kids: Collector[];
  reserve?: Collector;
  filters: CollectionFilters;
  onFilters: (f: CollectionFilters) => void;
  collapsed: Set<number>;
  onToggle: (page: number) => void;
  onStep: (card: Card, collector: Collector, delta: 1 | -1) => void;
  t: CollectionTexts;
}) {
  const pages = pagesList(album.cards);
  // A kid deleted in Réglages while selected falls back to everyone.
  const kid = kids.find((k) => k.id === filters.kid);
  const shown = kid ? [kid] : kids;

  const panels = pages
    .map((p) => ({
      page: p,
      cards: cardsOnPage(album.cards, p).filter((c) =>
        matches(c, filters, reserve),
      ),
    }))
    .filter((panel) => panel.cards.length);

  return (
    <>
      <div className="mb-4.5 flex flex-wrap gap-2">
        <TextInput
          type="search"
          value={filters.search}
          onChange={(e) => onFilters({ ...filters, search: e.target.value })}
          placeholder={t.search}
          aria-label={t.search}
          className="min-w-0 flex-[1_1_180px]"
        />
        <Select
          value={String(filters.page)}
          onChange={(value) =>
            onFilters({
              ...filters,
              page: value === "all" ? "all" : Number(value),
            })
          }
          aria-label={t.allPages}
          options={[
            { key: "all", label: t.allPages },
            ...pages.map((p) => ({ key: String(p), label: t.page(p) })),
          ]}
          className="flex-[0_1_170px]"
        />
        {kids.length > 1 && (
          <Select
            value={kid?.id ?? "all"}
            onChange={(value) =>
              onFilters({
                ...filters,
                kid: value,
                status: value === "all" ? "all" : `owned:${value}`,
              })
            }
            aria-label={t.allKids}
            options={[
              { key: "all", label: t.allKids },
              ...kids.map((k) => ({ key: k.id, label: k.name })),
            ]}
            className="flex-[0_1_170px]"
          />
        )}
        <Select
          value={filters.status}
          onChange={(status) => onFilters({ ...filters, status })}
          aria-label={t.all}
          options={[
            { key: "all", label: t.all },
            ...(kid
              ? [{ key: `owned:${kid.id}`, label: t.ownedBy(kid.name) }]
              : []),
            ...shown.map((k) => ({
              key: `missing:${k.id}`,
              label: t.missingFor(k.name),
            })),
            ...shown.map((k) => ({
              key: `dup:${k.id}`,
              label: t.duplicatesOf(k.name),
            })),
            ...(reserve ? [{ key: "reserve", label: t.inReserve }] : []),
          ]}
          className="flex-[0_1_210px]"
        />
      </div>

      {!kids.length && (
        <div className="mb-4 rounded-2xl bg-accent-soft p-4 text-sm">
          <strong>{t.noKidsTitle}</strong> {t.noKidsBody}
        </div>
      )}

      {!panels.length && (
        <div className="px-5 py-12 text-center text-muted">
          <h3 className="mb-1.5 text-foreground">{t.noMatchTitle}</h3>
          <p>{t.noMatchBody}</p>
        </div>
      )}

      {panels.map(({ page, cards }) => {
        const isCollapsed = collapsed.has(page);
        return (
          <div key={page} className="card mb-3.5 overflow-hidden">
            <div
              role="button"
              tabIndex={0}
              onClick={() => onToggle(page)}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && onToggle(page)
              }
              className="flex cursor-pointer items-center justify-between gap-2.5 bg-sunken px-4 py-3"
            >
              <div className="flex items-center gap-2.5">
                <h3 className="text-[15px]">{t.page(page)}</h3>
                <div className="flex gap-1.25">
                  {shown.map((k) => {
                    const done = pageComplete(album.cards, page, k.id);
                    return (
                      <PageBadge
                        key={k.id}
                        done={done}
                        collector={k}
                        title={
                          done
                            ? t.pageComplete(k.name)
                            : t.pageIncomplete(k.name)
                        }
                      >
                        {done ? (
                          <CheckIcon className="size-3" />
                        ) : (
                          k.name.charAt(0).toUpperCase()
                        )}
                      </PageBadge>
                    );
                  })}
                </div>
              </div>
              <ChevronIcon
                className={`size-4 text-muted transition-transform ${isCollapsed ? "-rotate-90" : ""}`}
              />
            </div>
            {!isCollapsed &&
              cards.map((card) => (
                <div
                  key={card.id}
                  className="grid grid-cols-[56px_1fr_auto_auto] items-center gap-x-3 gap-y-2.5 border-t border-line px-4 py-2.5"
                >
                  <span className="truncate font-mono font-bold text-muted">
                    {card.code}
                  </span>
                  <span
                    className={`truncate ${card.label ? "font-medium" : "text-muted italic"}`}
                  >
                    {card.label || "—"}
                  </span>
                  <div className="flex flex-wrap items-center justify-end gap-1.5">
                    {shown.map((k) => (
                      <Stepper
                        key={k.id}
                        card={card}
                        collector={k}
                        onStep={onStep}
                        t={t}
                      />
                    ))}
                    {reserve && (
                      <>
                        <span className="mx-0.5 w-px self-stretch bg-line" />
                        <Stepper
                          card={card}
                          collector={reserve}
                          onStep={onStep}
                          t={t}
                        />
                      </>
                    )}
                  </div>
                </div>
              ))}
          </div>
        );
      })}
    </>
  );
}
