"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { LOCALE_TAG, useLanguage } from "@/i18n";
import type { Anniversary } from "@repo/anniversaries";
import {
  addAnniversaryAction,
  leaveAnniversaryAction,
} from "../../anniversaries/actions";
import { EditEventForm, type EditEventFormTexts } from "./EditEventForm";

export type AnniversaryDetailTexts = {
  back: string;
  hebDate: string;
  members: string;
  upcoming: string;
  edit: string;
  viewInCalendar: string;
  join: string;
  joining: string;
  leave: string;
  leaving: string;
  leaveConfirm: string;
  error: (message: string) => string;
  editForm: EditEventFormTexts;
};

export function AnniversaryDetail({
  anniversary,
  t,
}: {
  anniversary: Anniversary;
  t: AnniversaryDetailTexts;
}) {
  const { locale } = useLanguage();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fmt = (iso: string) =>
    iso ? new Date(iso).toLocaleDateString(LOCALE_TAG[locale]) : "";

  const handleLeave = () => {
    if (!confirm(t.leaveConfirm)) return;
    startTransition(async () => {
      const result = await leaveAnniversaryAction(anniversary.id);
      if (!result.ok) {
        setError(t.error(result.error));
        return;
      }
      router.push("/anniversaries");
    });
  };

  const handleJoin = () => {
    startTransition(async () => {
      const result = await addAnniversaryAction({
        name: anniversary.name,
        hebDay: anniversary.hebDate.day,
        hebMonth: anniversary.hebDate.month,
        years: anniversary.events.length,
        sharedEmails: [],
        locale,
      });
      if (!result.ok) {
        setError(t.error(result.error));
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <Link href="/anniversaries" className="text-sm opacity-70 hover:opacity-100">
        {t.back}
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{anniversary.name}</h1>
          <p className="mt-1 text-sm opacity-70">
            {t.hebDate}: <span dir="ltr">{anniversary.hebDateLabel}</span>
          </p>
          {anniversary.members.length > 0 && (
            <p className="mt-1 text-sm opacity-70">
              {t.members}: {anniversary.members.join(", ")}
            </p>
          )}
        </div>
        {anniversary.joined ? (
          <button
            type="button"
            onClick={handleLeave}
            disabled={pending}
            className="shrink-0 rounded-lg border border-foreground/20 px-3 py-1.5 text-sm hover:bg-foreground/5 disabled:opacity-40"
          >
            {pending ? t.leaving : t.leave}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleJoin}
            disabled={pending}
            className="shrink-0 rounded-lg bg-foreground px-3 py-1.5 text-sm font-medium text-background hover:opacity-80 disabled:opacity-40"
          >
            {pending ? t.joining : t.join}
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex flex-col gap-3">
        <h2 className="font-medium">{t.upcoming}</h2>

        <ul className="flex flex-col divide-y divide-foreground/10 rounded-lg border border-foreground/15">
          {anniversary.events.map((event) => (
            <li key={event.id} className="flex flex-col">
              <div className="flex items-center justify-between gap-3 p-3 text-sm">
                <span>
                  {fmt(event.date)}
                  {event.time && (
                    <span className="opacity-60"> · {event.time}</span>
                  )}
                </span>
                <span className="flex items-center gap-3">
                  {event.htmlLink && (
                    <a
                      href={event.htmlLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="opacity-70 hover:opacity-100"
                    >
                      {t.viewInCalendar}
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setEditingId(editingId === event.id ? null : event.id)
                    }
                    disabled={pending}
                    className="opacity-70 hover:opacity-100 disabled:opacity-40"
                  >
                    {t.edit}
                  </button>
                </span>
              </div>

              {editingId === event.id && (
                <EditEventForm
                  anniversary={anniversary}
                  event={event}
                  t={t.editForm}
                  onDone={() => {
                    setEditingId(null);
                    router.refresh();
                  }}
                />
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
