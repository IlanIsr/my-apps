"use client";

/**
 * Client boundary for `/admin` (super-users only):
 * - "Update every event" — re-writes each person's calendar series as events
 *   are built today ({@link resyncPersonAction}, one person at a time, with
 *   progress; resumes where a Google rate limit stopped it).
 * - "Copy from production" ({@link syncFromProdAction}) mirrors the prod
 *   `persons` into this environment — pre-prod only (`PROD_DATABASE_URL`).
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { useTranslations } from "@/i18n";
import { Button } from "../components/Button";
import { Eyebrow } from "../components/Eyebrow";
import { Ornament } from "../components/Ornament";
import {
  listPersonIdsAction,
  resyncPersonAction,
  syncFromProdAction,
} from "./actions";

/** Text for {@link AdminView}. */
export type AdminTexts = {
  eyebrow: string;
  title: string;
  subtitle: string;
  empty: string;
  sync: {
    title: string;
    body: string;
    button: string;
    running: string;
    confirm: string;
    done: (written: number, deleted: number) => string;
    error: (message: string) => string;
  };
  resync: {
    title: string;
    body: string;
    button: string;
    resume: string;
    confirm: string;
    running: (done: number, total: number) => string;
    rateLimited: (done: number, total: number) => string;
    done: (total: number, failed: number) => string;
    error: (message: string) => string;
  };
};

export function AdminView({ canSync }: { canSync: boolean }) {
  const t = useTranslations().admin;
  const router = useRouter();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  // "Update every event": the ids still to do survive a rate-limit stop.
  const [queue, setQueue] = useState<{ ids: string[]; next: number } | null>(
    null,
  );
  const [resyncing, setResyncing] = useState(false);
  const [resyncMessage, setResyncMessage] = useState<string | null>(null);

  const runResync = async () => {
    let ids = queue?.ids;
    let next = queue?.next ?? 0;
    if (!ids) {
      if (!confirm(t.resync.confirm)) return;
      const listed = await listPersonIdsAction();
      if (!listed.ok) {
        setResyncMessage(t.resync.error(listed.error));
        return;
      }
      ids = listed.ids;
      next = 0;
    }
    setResyncing(true);
    let failed = 0;
    for (; next < ids.length; next++) {
      setResyncMessage(t.resync.running(next, ids.length));
      const result = await resyncPersonAction(ids[next]!);
      if (!result.ok && result.error === "rate-limited") {
        setQueue({ ids, next });
        setResyncing(false);
        setResyncMessage(t.resync.rateLimited(next, ids.length));
        return;
      }
      if (!result.ok) failed++;
    }
    setQueue(null);
    setResyncing(false);
    setResyncMessage(t.resync.done(ids.length, failed));
  };

  const runSync = () => {
    if (!confirm(t.sync.confirm)) return;
    setMessage(null);
    setFailed(false);
    start(async () => {
      const result = await syncFromProdAction();
      if (result.ok) {
        setMessage(t.sync.done(result.written, result.deleted));
        router.refresh();
      } else {
        setFailed(true);
        setMessage(t.sync.error(result.error));
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Eyebrow>{t.eyebrow}</Eyebrow>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
          {t.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.subtitle}</p>
      </div>

      <section className="flex flex-col gap-3 rounded-card border border-border bg-card p-5">
        <div>
          <h2 className="font-display text-lg font-semibold">
            {t.resync.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t.resync.body}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={resyncing}
          onClick={runResync}
          className="self-start"
        >
          {queue ? t.resync.resume : t.resync.button}
        </Button>
        {resyncMessage && (
          <p className="text-sm text-muted-foreground">{resyncMessage}</p>
        )}
      </section>

      {canSync ? (
        <section className="flex flex-col gap-3 rounded-card border border-border bg-card p-5">
          <div>
            <h2 className="font-display text-lg font-semibold">
              {t.sync.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{t.sync.body}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={runSync}
            className="self-start"
          >
            {pending ? t.sync.running : t.sync.button}
          </Button>
          {message && (
            <p
              className={`text-sm ${failed ? "text-destructive" : "text-muted-foreground"}`}
            >
              {message}
            </p>
          )}
        </section>
      ) : (
        <div className="flex flex-col items-center gap-2.5 rounded-card border border-dashed border-border-strong bg-card/50 px-6 py-10 text-center">
          <Ornament className="mb-1" />
          <p className="max-w-xs text-sm text-muted-foreground">{t.empty}</p>
        </div>
      )}
    </div>
  );
}
