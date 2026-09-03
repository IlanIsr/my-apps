"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { LOCALE_TAG, useLanguage, useTranslations } from "@/i18n";
import type { Anniversary } from "@/lib/anniversary";
import {
  deleteAnniversaryAction,
  deleteEventAction,
} from "../../anniversaries/actions";
import { EditEventForm, type EditEventFormTexts } from "./EditEventForm";

export type AnniversaryDetailTexts = {
  back: string;
  hebDate: string;
  sharedWith: string;
  upcoming: string;
  deleteAll: string;
  delete: string;
  edit: string;
  viewInCalendar: string;
  deleteConfirm: string;
  deleteAllConfirm: (name: string) => string;
  error: (message: string) => string;
  editForm: EditEventFormTexts;
};

export function AnniversaryDetail({
  anniversary,
}: {
  anniversary: Anniversary;
}) {
  const t = useTranslations().anniversaryDetail;
  const { locale } = useLanguage();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fmt = (iso: string) =>
    iso ? new Date(iso).toLocaleDateString(LOCALE_TAG[locale]) : "";

  const handleDeleteAll = () => {
    if (!confirm(t.deleteAllConfirm(anniversary.name))) return;
    startTransition(async () => {
      const result = await deleteAnniversaryAction(anniversary.id);
      if (!result.ok) {
        setError(t.error(result.error));
        return;
      }
      router.push("/anniversaries");
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    if (!confirm(t.deleteConfirm)) return;
    startTransition(async () => {
      const result = await deleteEventAction(anniversary.id, eventId);
      if (!result.ok) setError(t.error(result.error));
      else router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <Link href="/anniversaries" className="text-sm opacity-70 hover:opacity-100">
        {t.back}
      </Link>

      <div>
        <h1 className="text-2xl font-bold">{anniversary.name}</h1>
        <p className="mt-1 text-sm opacity-70">
          {t.hebDate}: <span dir="ltr">{anniversary.hebDateLabel}</span>
          {anniversary.shared.length > 0 && (
            <>
              {" · "}
              {t.sharedWith}: {anniversary.shared.join(", ")}
            </>
          )}
        </p>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-medium">{t.upcoming}</h2>
          {anniversary.events.length > 0 && (
            <button
              type="button"
              onClick={handleDeleteAll}
              disabled={pending}
              className="text-sm text-red-500 hover:underline disabled:opacity-40"
            >
              {t.deleteAll}
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
                  <button
                    type="button"
                    onClick={() => handleDeleteEvent(event.id)}
                    disabled={pending}
                    className="text-red-500 hover:underline disabled:opacity-40"
                  >
                    {t.delete}
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
