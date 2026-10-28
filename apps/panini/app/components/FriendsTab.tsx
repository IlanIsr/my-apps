"use client";

/**
 * "Amis" tab: my own share (name, link, who joined) and the albums friends
 * shared with me. A friend's album is only ever an aggregate — which cards the
 * family has / is looking for — never who owns what.
 */

import { useState } from "react";

import type { FriendsData } from "@/app/actions";
import {
  naturalCompare,
  shareSummary,
  tradeMatch,
  type Album,
  type SharedAlbum,
} from "@/lib/album-logic";

import { Button } from "./Button";
import { Modal, onFormSubmit, type ModalTexts } from "./Modal";
import { TextInput } from "./TextInput";

export type FriendsTexts = {
  myShareTitle: string;
  myShareIntro: string;
  displayName: string;
  displayNameHint: string;
  startSharing: string;
  rename: string;
  save: string;
  cancel: string;
  link: string;
  copyLink: string;
  copied: string;
  renewLink: string;
  renewHint: string;
  stopSharing: string;
  stopConfirm: string;
  viewersTitle: (n: number) => string;
  noViewers: string;
  removeViewer: string;
  sharedTitle: string;
  sharedEmpty: string;
  summary: (has: number, wants: number) => string;
  match: (theyGive: number, iGive: number) => string;
  has: (n: number) => string;
  wants: (n: number) => string;
  hasHint: string;
  wantsHint: string;
  nothing: string;
  search: string;
  page: (n: number) => string;
  copyList: string;
  copyText: (name: string, has: string, wants: string) => string;
  leave: string;
  leaveConfirm: (name: string) => string;
};

export type FriendsHandlers = {
  saveShare: (displayName: string) => Promise<boolean>;
  renewToken: () => Promise<boolean>;
  deleteShare: () => Promise<boolean>;
  removeViewer: (viewerId: string) => Promise<boolean>;
  leave: (albumId: string) => Promise<boolean>;
};

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  return {
    copied,
    copy: (key: string, text: string) =>
      void navigator.clipboard.writeText(text).then(() => {
        setCopied(key);
        setTimeout(() => setCopied((c) => (c === key ? null : c)), 2000);
      }),
  };
}

export function FriendsTab({
  album,
  data,
  origin,
  handlers,
  t,
  modalT,
}: {
  album: Album;
  data: FriendsData;
  origin: string;
  handlers: FriendsHandlers;
  t: FriendsTexts;
  modalT: ModalTexts;
}) {
  const [open, setOpen] = useState<SharedAlbum | null>(null);
  const mine = shareSummary(album);
  const openShared =
    open && data.shared.find((s) => s.albumId === open.albumId);

  return (
    <>
      <MyShareCard
        album={album}
        data={data}
        origin={origin}
        handlers={handlers}
        t={t}
      />

      <h2 className="mt-6 mb-2.5 text-[17px]">{t.sharedTitle}</h2>
      {data.shared.length ? (
        <div className="card overflow-hidden">
          {data.shared.map((s) => {
            const match = tradeMatch(mine, s);
            return (
              <Button
                key={s.albumId}
                variant="ghost"
                onClick={() => setOpen(s)}
                className="flex h-auto w-full flex-col items-start gap-0.5 rounded-none border-t border-line px-4 py-3 text-start font-normal first:border-t-0"
              >
                <span className="text-[15px] font-semibold">{s.name}</span>
                <span className="text-[12.5px] text-muted">
                  {t.summary(s.has.length, s.wants.length)}
                </span>
                {(match.theyGive.length > 0 || match.iGive.length > 0) && (
                  <span className="text-[12.5px] font-semibold text-accent">
                    {t.match(match.theyGive.length, match.iGive.length)}
                  </span>
                )}
              </Button>
            );
          })}
        </div>
      ) : (
        <p className="card p-4 text-sm text-muted">{t.sharedEmpty}</p>
      )}

      {openShared && (
        <SharedAlbumModal
          album={album}
          shared={openShared}
          onLeave={async () =>
            (await handlers.leave(openShared.albumId)) && setOpen(null)
          }
          onClose={() => setOpen(null)}
          t={t}
          modalT={modalT}
        />
      )}
    </>
  );
}

function MyShareCard({
  album,
  data,
  origin,
  handlers,
  t,
}: {
  album: Album;
  data: FriendsData;
  origin: string;
  handlers: FriendsHandlers;
  t: FriendsTexts;
}) {
  const share = data.myShare;
  const [editing, setEditing] = useState(false);
  const [confirmingStop, setConfirmingStop] = useState(false);
  const { copied, copy } = useCopy();

  const nameForm = (submitLabel: string, defaultValue: string) => (
    <form
      onSubmit={onFormSubmit(async (form) => {
        const ok = await handlers.saveShare(String(form.get("displayName")));
        if (ok) setEditing(false);
      })}
      className="flex flex-col gap-2"
    >
      <label
        htmlFor="share-name"
        className="text-[12.5px] font-semibold text-muted"
      >
        {t.displayName}
      </label>
      <TextInput
        id="share-name"
        name="displayName"
        defaultValue={defaultValue}
        required
      />
      <span className="text-xs text-muted">{t.displayNameHint}</span>
      <div className="mt-1 flex gap-2">
        <Button type="submit" variant="primary">
          {submitLabel}
        </Button>
        {share && (
          <Button variant="ghost" onClick={() => setEditing(false)}>
            {t.cancel}
          </Button>
        )}
      </div>
    </form>
  );

  if (!share) {
    return (
      <div className="card p-4">
        <h2 className="mb-1 text-[17px]">{t.myShareTitle}</h2>
        <p className="mb-3.5 text-sm text-muted">{t.myShareIntro}</p>
        {nameForm(t.startSharing, album.name)}
      </div>
    );
  }

  const link = `${origin}/share/${share.token}`;
  return (
    <div className="card p-4">
      <h2 className="mb-3 text-[17px]">{t.myShareTitle}</h2>
      {editing ? (
        nameForm(t.save, share.displayName)
      ) : (
        <div className="mb-3.5 flex items-center gap-2">
          <span className="text-[15px] font-semibold">{share.displayName}</span>
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
            {t.rename}
          </Button>
        </div>
      )}

      <div className="mt-3 text-[12.5px] font-semibold text-muted">
        {t.link}
      </div>
      <div className="mt-1 mb-2 truncate rounded-lg bg-background px-3 py-2 font-mono text-xs">
        {link}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" size="sm" onClick={() => copy("link", link)}>
          {copied === "link" ? t.copied : t.copyLink}
        </Button>
        <Button size="sm" onClick={() => void handlers.renewToken()}>
          {t.renewLink}
        </Button>
      </div>
      <p className="mt-1.5 text-xs text-muted">{t.renewHint}</p>

      <div className="mt-4 mb-1.5 text-[12.5px] font-semibold text-muted">
        {t.viewersTitle(share.viewers.length)}
      </div>
      {share.viewers.length ? (
        share.viewers.map((v) => (
          <div
            key={v.viewerId}
            className="flex items-center gap-2 border-t border-line py-1.5 text-sm first:border-t-0"
          >
            <span>{v.name}</span>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto text-danger"
              onClick={() => void handlers.removeViewer(v.viewerId)}
            >
              {t.removeViewer}
            </Button>
          </div>
        ))
      ) : (
        <p className="text-[13px] text-muted italic">{t.noViewers}</p>
      )}

      <div className="mt-4 border-t border-line pt-3">
        {confirmingStop ? (
          <>
            <p className="mb-2 text-xs text-muted">{t.stopConfirm}</p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmingStop(false)}
              >
                {t.cancel}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() =>
                  void handlers
                    .deleteShare()
                    .then(() => setConfirmingStop(false))
                }
              >
                {t.stopSharing}
              </Button>
            </div>
          </>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="text-danger"
            onClick={() => setConfirmingStop(true)}
          >
            {t.stopSharing}
          </Button>
        )}
      </div>
    </div>
  );
}

function SharedAlbumModal({
  album,
  shared,
  onLeave,
  onClose,
  t,
  modalT,
}: {
  album: Album;
  shared: SharedAlbum;
  onLeave: () => void;
  onClose: () => void;
  t: FriendsTexts;
  modalT: ModalTexts;
}) {
  const [query, setQuery] = useState("");
  const [confirmingLeave, setConfirmingLeave] = useState(false);
  const { copied, copy } = useCopy();

  const pageOf = new Map(album.cards.map((c) => [c.code, c.page]));
  const mine = shareSummary(album);
  const { theyGive, iGive } = tradeMatch(mine, shared);
  const highlightHas = new Set(theyGive);
  const highlightWants = new Set(iGive);

  const q = query.trim().toLowerCase();
  const matches = (code: string) =>
    !q || code.toLowerCase().includes(q) || String(pageOf.get(code)) === q;

  const section = (
    title: string,
    hint: string,
    codes: string[],
    highlight: Set<string>,
  ) => {
    const byPage = new Map<number, string[]>();
    for (const code of codes.filter(matches)) {
      const page = pageOf.get(code) ?? 0;
      byPage.set(page, [...(byPage.get(page) ?? []), code]);
    }
    return (
      <section className="mb-4">
        <h3 className="text-[14px] font-bold">{title}</h3>
        <p className="mb-2 text-xs text-muted">{hint}</p>
        {byPage.size ? (
          [...byPage]
            .sort(([a], [b]) => a - b)
            .map(([page, list]) => (
              <div key={page} className="mb-1.5 flex gap-2">
                <span className="w-14 flex-none pt-0.5 text-[11.5px] text-muted">
                  {t.page(page)}
                </span>
                <div className="flex flex-wrap gap-1">
                  {list.sort(naturalCompare).map((code) => (
                    <span
                      key={code}
                      className={`rounded-md px-1.5 py-0.5 font-mono text-xs font-bold ${
                        highlight.has(code)
                          ? "bg-accent text-white"
                          : "bg-background"
                      }`}
                    >
                      {code}
                    </span>
                  ))}
                </div>
              </div>
            ))
        ) : (
          <p className="text-[13px] text-muted italic">{t.nothing}</p>
        )}
      </section>
    );
  };

  return (
    <Modal title={shared.name} onClose={onClose} t={modalT}>
      <TextInput
        aria-label={t.search}
        placeholder={t.search}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-3"
      />
      {section(t.has(shared.has.length), t.hasHint, shared.has, highlightHas)}
      {section(
        t.wants(shared.wants.length),
        t.wantsHint,
        shared.wants,
        highlightWants,
      )}

      <div className="flex flex-wrap gap-2 border-t border-line pt-3">
        <Button
          size="sm"
          onClick={() =>
            copy(
              "list",
              t.copyText(
                shared.name,
                shared.has.join(", "),
                shared.wants.join(", "),
              ),
            )
          }
        >
          {copied === "list" ? t.copied : t.copyList}
        </Button>
        {confirmingLeave ? (
          <Button variant="danger" size="sm" onClick={onLeave}>
            {t.leaveConfirm(shared.name)}
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto text-danger"
            onClick={() => setConfirmingLeave(true)}
          >
            {t.leave}
          </Button>
        )}
      </div>
    </Modal>
  );
}
