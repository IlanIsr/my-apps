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
  deleteShareAction,
  getFriendsAction,
  leaveShareAction,
  removeViewerAction,
  renewShareTokenAction,
  resetAlbumAction,
  saveShareAction,
  stepCountAction,
  updateCollectorAction,
  updateSettingsAction,
  type ActionErrorCode,
  type ActionResult,
  type FriendsData,
} from "@/app/actions";
import { LOCALE_TAG, useLanguage, useTranslations } from "@/i18n";
import {
  countOf,
  kidsOf,
  reserveOf,
  type Album,
  type Card,
  type Collector,
} from "@/lib/album-logic";

import { ToggleButton } from "@repo/ui/toggle-button";
import { ToggleButtonGroup } from "@repo/ui/toggle-button-group";

import { Button } from "./Button";
import { ReserveTab, TradesTab } from "./CardLists";
import { CollectionTab, type CollectionFilters } from "./CollectionTab";
import { FriendsTab, type FriendsHandlers } from "./FriendsTab";
import { GearIcon } from "./icons";
import { PagesTab } from "./PagesTab";
import { RewardsTab } from "./RewardsTab";
import { SettingsModal, type SettingsHandlers } from "./SettingsModal";
import { SetupView } from "./SetupView";
import { StatsStrip } from "./StatsStrip";

const TABS = [
  "collection",
  "trades",
  "reserve",
  "pages",
  "rewards",
  "friends",
] as const;
export type Tab = (typeof TABS)[number];

export type AppTexts = {
  eyebrow: string;
  settings: string;
  dismiss: string;
  tabs: Record<Tab, string>;
  errors: Record<ActionErrorCode, string>;
};

type ModalState = { type: "settings" };

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

export function PaniniApp({
  initialAlbum,
  initialFriends,
  origin,
  initialTab = "collection",
}: {
  initialAlbum: Album | null;
  initialFriends: FriendsData;
  /** This deployment's origin, to build share links. */
  origin: string;
  initialTab?: Tab;
}) {
  const t = useTranslations();
  const { locale } = useLanguage();
  const [album, setAlbum] = useState(initialAlbum);
  const [friends, setFriends] = useState(initialFriends);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>(initialTab);
  const [filters, setFilters] = useState<CollectionFilters>({
    search: "",
    page: "all",
    kid: "all",
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

  /** Same as `apply`, for the "Amis" tab's data. */
  const applyFriends = useCallback(
    async (pending: Promise<ActionResult<FriendsData>>) => {
      const result = await pending;
      if (!result.ok) {
        setError(t.app.errors[result.error]);
        return false;
      }
      setError(null);
      setFriends(result.data);
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

  const friendsHandlers: FriendsHandlers = {
    saveShare: (name) => applyFriends(saveShareAction(name)),
    renewToken: () => applyFriends(renewShareTokenAction()),
    deleteShare: () => applyFriends(deleteShareAction()),
    removeViewer: (id) => applyFriends(removeViewerAction(id)),
    leave: (albumId) => applyFriends(leaveShareAction(albumId)),
  };

  const closeModal = () => setModal(null);
  return (
    <div className="mx-auto max-w-220 px-[clamp(16px,4vw,32px)] pt-2 pb-16">
      <div className="mb-5.5 flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] font-semibold tracking-[.14em] text-accent uppercase">
            {t.app.eyebrow}
          </p>
          <h1 className="mt-1 text-[clamp(26px,4vw,34px)]">{album.name}</h1>
        </div>
        <Button
          isIconOnly
          onClick={() => setModal({ type: "settings" })}
          aria-label={t.app.settings}
          className="flex-none text-muted"
        >
          <GearIcon className="size-4.5" />
        </Button>
      </div>

      <StatsStrip kids={kids} cards={album.cards} t={t.stats} />

      <ToggleButtonGroup
        aria-label={t.app.eyebrow}
        selectionMode="single"
        disallowEmptySelection
        selectedKeys={[tab]}
        onSelectionChange={(keys) => {
          const [key] = keys;
          if (key === undefined) return;
          setTab(key as Tab);
          // Friends' albums change on their side — refresh on every visit.
          if (key === "friends") void applyFriends(getFriendsAction());
        }}
        fullWidth
        className="mb-4.5 overflow-x-auto"
      >
        {TABS.map((key) => (
          <ToggleButton key={key} id={key} className="whitespace-nowrap">
            {t.app.tabs[key]}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

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
            setFilters({ ...filters, search: "", page, status: "all" });
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
          t={t.rewards}
        />
      )}
      {tab === "friends" && (
        <FriendsTab
          album={album}
          data={friends}
          origin={origin}
          handlers={friendsHandlers}
          t={t.friends}
          modalT={t.modal}
        />
      )}

      {error && (
        <div
          role="alert"
          className="fixed inset-x-4 bottom-24 z-60 mx-auto flex max-w-md items-center justify-between gap-3 rounded-xl bg-danger px-4 py-3 text-sm font-semibold text-white shadow-card"
        >
          <span>{error}</span>
          <Button
            variant="ghost"
            size="sm"
            isIconOnly
            onClick={() => setError(null)}
            aria-label={t.app.dismiss}
            className="text-white"
          >
            ✕
          </Button>
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
    </div>
  );
}
