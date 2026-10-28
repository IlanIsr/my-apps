"use client";

/**
 * Profile card: the user's private calendar-feed link (`/feed/<token>.ics`).
 * Apple Calendar subscribes through the `webcal://` link; Outlook / Google take
 * the `https://` URL. Read-only — the subscriber's app refreshes it itself.
 * "New link" replaces the token, so a leaked URL stops working.
 */

import { useState } from "react";

import { useLanguage } from "@/i18n";
import { Button } from "../components/Button";
import { TextInput } from "../components/TextInput";
import { feedTokenAction } from "./actions";

/** Text for {@link CalendarFeed}. */
export type CalendarFeedTexts = {
  title: string;
  intro: string;
  show: string;
  loading: string;
  subscribe: string;
  /** For calendars other than Apple's (copy the URL). */
  otherApps: string;
  copy: string;
  copied: string;
  renew: string;
  /** What "New link" does. */
  renewHint: string;
  error: string;
  /** Name of the subscribed calendar in the user's app. */
  calendarName: string;
};

export function CalendarFeed({ t }: { t: CalendarFeedTexts }) {
  const { locale } = useLanguage();
  const [url, setUrl] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = async (renew: boolean) => {
    setPending(true);
    setError(false);
    setCopied(false);
    const result = await feedTokenAction(renew);
    setPending(false);
    if (!result.ok) {
      setError(true);
      return;
    }
    setUrl(`${window.location.origin}/feed/${result.token}.ics?lang=${locale}`);
  };

  const copy = async () => {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
  };

  const label =
    "font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-subtle-foreground";

  return (
    <section className="flex flex-col gap-3 rounded-card border border-border bg-card p-5">
      <span className={label}>{t.title}</span>
      <p className="text-sm text-muted-foreground">{t.intro}</p>

      {url ? (
        <>
          <a
            href={url.replace(/^https?:/, "webcal:")}
            className="self-start rounded-pill bg-primary px-4 py-2 text-sm font-semibold whitespace-nowrap text-primary-foreground transition-opacity hover:opacity-90"
          >
            {t.subscribe}
          </a>
          <p className="text-xs text-muted-foreground">{t.otherApps}</p>
          <div className="flex items-center gap-2">
            <TextInput
              readOnly
              value={url}
              dir="ltr"
              onFocus={(e) => e.target.select()}
              className="flex-1"
            />
            <Button onClick={copy} variant="outline" className="shrink-0">
              {copied ? t.copied : t.copy}
            </Button>
          </div>
          <div className="flex flex-col gap-1">
            <Button
              onClick={() => load(true)}
              disabled={pending}
              variant="ghost"
              size="sm"
              className="self-start"
            >
              {t.renew}
            </Button>
            <p className="text-xs text-subtle-foreground">{t.renewHint}</p>
          </div>
        </>
      ) : (
        <Button
          onClick={() => load(false)}
          disabled={pending}
          className="self-start"
        >
          {pending ? t.loading : t.show}
        </Button>
      )}
      {error && <p className="text-xs text-destructive">{t.error}</p>}
    </section>
  );
}
