"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useI18n } from "@/i18n/context";
import { LOCALE_TAG } from "@/i18n/config";
import type { Anniversary } from "@/lib/anniversary";
import {
  deleteAnniversaryAction,
  deleteEventAction,
} from "../../anniversaries/actions";
import { EditEventForm } from "./EditEventForm";

export function AnniversaryDetail({
  anniversary,
}: {
  anniversary: Anniversary;
}) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fmt = (iso: string) =>
    iso ? new Date(iso).toLocaleDateString(LOCALE_TAG[locale]) : "";

  const handleDeleteAll = () => {
    if (!confirm(t.calendar.events.deleteAllConfirm(anniversary.name))) return;
    startTransition(async () => {
      const result = await deleteAnniversaryAction(anniversary.id);
      if (!result.ok) {
        setError(t.anniversary.toast.error(result.error));
        return;
      }
      router.push("/anniversaries");
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    if (!confirm(t.calendar.events.deleteConfirm)) return;
    startTransition(async () => {
      const result = await deleteEventAction(anniversary.id, eventId);
      if (!result.ok) setError(t.anniversary.toast.error(result.error));
      else router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <Link href="/anniversaries" className="text-sm opacity-70 hover:opacity-100">
        {t.anniversary.detail.back}
      </Link>

      <div>
        <h1 className="text-2xl font-bold">{anniversary.name}</h1>
        <p className="mt-1 text-sm opacity-70">
          {t.anniversary.detail.hebDate}:{" "}
          <span dir="ltr">{anniversary.hebDateLabel}</span>
          {anniversary.shared.length > 0 && (
            <>
              {" · "}
              {t.anniversary.detail.sharedWith}: {anniversary.shared.join(", ")}
            </>
          )}
        </p>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-medium">{t.anniversary.detail.upcoming}</h2>
          {anniversary.events.length > 0 && (
            <button
              type="button"
              onClick={handleDeleteAll}
              disabled={pending}
              className="text-sm text-red-500 hover:underline disabled:opacity-40"
            >
              {t.anniversary.detail.deleteAll}
            </button>
          )}
        </div>

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
                      {t.calendar.events.viewInCalendar}
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
                    {t.calendar.events.edit}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteEvent(event.id)}
                    disabled={pending}
                    className="text-red-500 hover:underline disabled:opacity-40"
                  >
                    {t.calendar.actions.delete}
                  </button>
                </span>
              </div>

              {editingId === event.id && (
                <EditEventForm
                  anniversary={anniversary}
                  event={event}
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
