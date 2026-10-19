"use client";

/**
 * Client boundary for `/anniversaries/share/[id]` — like `AnniversariesView`/
 * `AnniversaryDetailView`, it's the topmost client node after the server
 * page's fetch, so it's one of the few components that calls
 * {@link useTranslations} directly instead of taking `t` as a prop.
 *
 * Lets the signed-in viewer pick which of the link's anniversaries to join —
 * always themselves ({@link joinShareLinkAction} never takes an email, it
 * always uses the signed-in session). Items already joined show pre-checked
 * and disabled.
 */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useLanguage, useTranslations } from "@/i18n";
import type { ShareLinkPreviewItem } from "@repo/anniversaries";
import { resolveErrorMessage } from "@repo/utils";
import { joinShareLinkAction } from "../../actions";
import { CalendarUnavailable } from "../../../components/anniversary/CalendarUnavailable";

/** Text for {@link ShareLinkView}. */
export type ShareLinkViewTexts = {
  title: string;
  intro: string;
  expiredTitle: string;
  expiredBody: string;
  backToList: string;
  alreadyJoined: string;
  join: string;
  joining: string;
  nothingSelected: string;
  rateLimited: string;
  result: (joined: number, alreadyJoined: number, failed: number) => string;
  error: (message: string) => string;
};

export function ShareLinkView({
  configured,
  id,
  preview,
}: {
  configured: boolean;
  id: string;
  preview: { expired: boolean; items: ShareLinkPreviewItem[] } | null;
}) {
  const messages = useTranslations();
  const { locale } = useLanguage();
  const router = useRouter();
  const t = messages.shareLinkView;

  const [selected, setSelected] = useState<Set<string>>(() => {
    if (!preview) return new Set();
    return new Set(
      preview.items.filter((i) => !i.alreadyJoined).map((i) => i.id),
    );
  });
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!configured) {
    return <CalendarUnavailable t={messages.calendarUnavailable} />;
  }
  if (!preview) return null;

  if (preview.expired) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="font-display text-xl font-semibold">
          {t.expiredTitle}
        </p>
        <p className="max-w-xs text-sm text-muted-foreground">
          {t.expiredBody}
        </p>
        <Link
          href="/anniversaries"
          className="mt-2 text-sm font-semibold text-primary hover:underline"
        >
          {t.backToList}
        </Link>
      </div>
    );
  }

  const toggle = (itemId: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });

  const joinable = preview.items.filter((i) => !i.alreadyJoined);

  const submit = async () => {
    setError(null);
    setMessage(null);
    if (selected.size === 0) {
      setError(t.nothingSelected);
      return;
    }
    setPending(true);
    const result = await joinShareLinkAction(id, [...selected], locale);
    setPending(false);
    if (!result.ok) {
      setError(resolveErrorMessage(result.error, {}, t.error));
      return;
    }
    const { joined, alreadyJoined, failed, rateLimited } = result.data;
    setMessage(
      (rateLimited ? `${t.rateLimited} ` : "") +
        t.result(joined, alreadyJoined, failed),
    );
    router.refresh();
  };

  return (
    <div className="flex max-w-md flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          {t.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.intro}</p>
      </div>

      <ul className="flex flex-col divide-y divide-hairline overflow-hidden rounded-card border border-border bg-card">
        {preview.items.map((item) => (
          <li key={item.id}>
            <label
              className={`flex items-center gap-2.5 px-3 py-2.5 text-sm ${
                item.alreadyJoined ? "" : "cursor-pointer hover:bg-sunken"
              }`}
            >
              <input
                type="checkbox"
                checked={item.alreadyJoined || selected.has(item.id)}
                disabled={item.alreadyJoined}
                onChange={() => toggle(item.id)}
                className="h-4 w-4 accent-primary disabled:opacity-50"
              />
              <span className="font-display">{item.name}</span>
              <span
                className={`ms-auto text-[11px] ${
                  item.type === "yahrzeit" ? "text-yahrzeit" : "text-birthday"
                }`}
                dir="ltr"
              >
                {item.hebDateLabel}
              </span>
              {item.alreadyJoined && (
                <span className="text-[11px] text-subtle-foreground">
                  {t.alreadyJoined}
                </span>
              )}
            </label>
          </li>
        ))}
      </ul>

      {message && <p className="text-sm text-muted-foreground">{message}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {joinable.length > 0 && (
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="self-start rounded-field bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40"
        >
          {pending ? t.joining : t.join}
        </button>
      )}
    </div>
  );
}
