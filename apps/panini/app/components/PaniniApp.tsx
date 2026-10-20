"use client";

/**
 * Client root (the i18n boundary — the only `useTranslations()` call). Holds
 * the album in state: structural changes go through a server action that
 * returns the fresh album; +/− taps update optimistically and roll back if
 * the server refuses.
 */

import { useCallback, useMemo, useState } from "react";

import {
  addCollectorAction,
  createAlbumAction,
  deleteCollectorAction,
  deletePageRewardAction,
  resetAlbumAction,
  setPageRewardAction,
  stepCountAction,
  updateCollectorAction,
  updateSettingsAction,
  type ActionErrorCode,
  type ActionResult,
} from "@/app/actions";
import { LOCALE_TAG, useLanguage, useTranslations } from "@/i18n";
import {
  countOf,
  kidsOf,
  pagesList,
  reserveOf,
  type Album,
  type Card,
  type Collector,
  type PageReward,
} from "@/lib/album-logic";

import { ReserveTab, TradesTab } from "./CardLists";
import { CollectionTab, type CollectionFilters } from "./CollectionTab";
import { GearIcon } from "./icons";
import { PagesTab } from "./PagesTab";
import { RewardModal } from "./RewardModal";
import { RewardsTab } from "./RewardsTab";
import { SettingsModal, type SettingsHandlers } from "./SettingsModal";
import { SetupView } from "./SetupView";
import { StatsStrip } from "./StatsStrip";

const TABS = ["collection", "trades", "reserve", "pages", "rewards"] as const;
type Tab = (typeof TABS)[number];

export type AppTexts = {
  eyebrow: string;
  settings: string;
  dismiss: string;
  tabs: Record<Tab, string>;
  errors: Record<ActionErrorCode, string>;
};

type ModalState =
  { type: "settings" } | { type: "reward"; page?: number; reward?: PageReward };

function withCount(
  album: Album,
  cardId: string,
  collectorId: string,
  delta: number,
): Album {
  return {
    ...album,
    cards: album.cards.map((c) =>
      c.id === cardId
        ? {
            ...c,
            counts: {
              ...c.counts,
              [collectorId]: Math.max(0, countOf(c, collectorId) + delta),
            },
          }
        : c,
    ),
  };
}

export function PaniniApp({ initialAlbum }: { initialAlbum: Album | null }) {
  const t = useTranslations();
  const { locale } = useLanguage();
  const [album, setAlbum] = useState(initialAlbum);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("collection");
  const [filters, setFilters] = useState<CollectionFilters>({
    search: "",
    page: "all",
    status: "all",
  });
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
  const [modal, setModal] = useState<ModalState | null>(null);

  /** Applies a mutation's result; `true` on success. */
  const apply = useCallback(
    async (pending: Promise<ActionResult<Album | null>>) => {
      const result = await pending;
      if (!result.ok) {
        setError(t.app.errors[result.error]);
        return false;
      }
      setError(null);
      setAlbum(result.data);
      return true;
    },
    [t],
  );

  const formatDate = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(LOCALE_TAG[locale], {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
    return (iso: string) => fmt.format(new Date(`${iso}T00:00:00Z`));
  }, [locale]);

  if (!album) {
    return (
      <SetupView
        onCreate={(input) => apply(createAlbumAction(input))}
        t={t.setup}
      />
    );
  }

  const kids = kidsOf(album);
  const reserve = reserveOf(album);
  const pages = pagesList(album.cards);

  function step(card: Card, collector: Collector, delta: 1 | -1) {
    if (delta < 0 && countOf(card, collector.id) === 0) return;
    setAlbum((a) => a && withCount(a, card.id, collector.id, delta));
    void stepCountAction(card.id, collector.id, delta).then((result) => {
      if (result.ok) return;
      setAlbum((a) => a && withCount(a, card.id, collector.id, -delta));
      setError(t.app.errors[result.error]);
    });
  }

  const settingsHandlers: SettingsHandlers = {
    updateSettings: (input) => apply(updateSettingsAction(input)),
    addCollector: (input) => apply(addCollectorAction(input)),
    updateCollector: (id, input) => apply(updateCollectorAction(id, input)),
    deleteCollector: (id) => apply(deleteCollectorAction(id)),
    reset: () => apply(resetAlbumAction()),
  };

  const closeModal = () => setModal(null);
  const rewardFor = (page: number) =>
    album.rewards.find((r) => r.page === page);

  return (
    <div className="mx-auto max-w-220 px-[clamp(16px,4vw,32px)] pt-2 pb-16">
      <div className="mb-5.5 flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] font-semibold tracking-[.14em] text-accent uppercase">
            {t.app.eyebrow}
          </p>
          <h1 className="mt-1 text-[clamp(26px,4vw,34px)]">{album.name}</h1>
        </div>
        <button
          type="button"
          onClick={() => setModal({ type: "settings" })}
          aria-label={t.app.settings}
          className="flex size-10 flex-none items-center justify-center rounded-lg border border-line bg-surface text-muted hover:border-line-strong hover:text-foreground"
        >
          <GearIcon className="size-4.5" />
        </button>
      </div>

      <StatsStrip kids={kids} cards={album.cards} t={t.stats} />

      <div className="mb-4.5 flex gap-1 overflow-x-auto rounded-xl bg-sunken p-1">
        {TABS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex-1 rounded-[10px] px-2.5 py-2.25 text-[13.5px] font-semibold whitespace-nowrap ${
              tab === key
                ? "bg-surface text-foreground shadow-card"
                : "text-muted"
            }`}
          >
            {t.app.tabs[key]}
          </button>
        ))}
      </div>

      {tab === "collection" && (
        <CollectionTab
          album={album}
          kids={kids}
          reserve={reserve}
          filters={filters}
          onFilters={setFilters}
          collapsed={collapsed}
          onToggle={(p) =>
            setCollapsed((prev) => {
              const next = new Set(prev);
              if (!next.delete(p)) next.add(p);
              return next;
            })
          }
          onStep={step}
          onEditReward={(page) =>
            setModal({ type: "reward", page, reward: rewardFor(page) })
          }
          t={t.collection}
        />
      )}
      {tab === "trades" && <TradesTab album={album} t={t.cardLists} />}
      {tab === "reserve" && (
        <ReserveTab album={album} reserve={reserve} t={t.cardLists} />
      )}
      {tab === "pages" && (
        <PagesTab
          album={album}
          kids={kids}
          onOpenPage={(page) => {
            setFilters({ search: "", page, status: "all" });
            setTab("collection");
            window.scrollTo({ top: 0 });
          }}
          t={t.pages}
        />
      )}
      {tab === "rewards" && (
        <RewardsTab
          album={album}
          kids={kids}
          reserve={reserve}
          formatDate={formatDate}
          onAdd={() => setModal({ type: "reward" })}
          onEdit={(reward) =>
            setModal({ type: "reward", page: reward.page, reward })
          }
          t={t.rewards}
        />
      )}

      {error && (
        <div
          role="alert"
          className="fixed inset-x-4 bottom-24 z-60 mx-auto flex max-w-md items-center justify-between gap-3 rounded-xl bg-danger px-4 py-3 text-sm font-semibold text-white shadow-card"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            aria-label={t.app.dismiss}
          >
            ✕
          </button>
        </div>
      )}

      {modal?.type === "settings" && (
        <SettingsModal
          album={album}
          kids={kids}
          handlers={settingsHandlers}
          onClose={closeModal}
          t={t.settings}
          modalT={t.modal}
        />
      )}
      {modal?.type === "reward" && (
        <RewardModal
          page={modal.page}
          pages={pages}
          reward={modal.reward}
          onSave={(reward) => apply(setPageRewardAction(reward))}
          onDelete={(page) => apply(deletePageRewardAction(page))}
          onClose={closeModal}
          t={t.rewardModal}
          modalT={t.modal}
        />
      )}
    </div>
  );
}
