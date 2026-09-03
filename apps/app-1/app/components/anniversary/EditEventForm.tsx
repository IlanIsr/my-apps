"use client";

import { useState } from "react";

import { useI18n } from "@/i18n/context";
import type { Anniversary, AnniversaryEvent } from "@/lib/anniversary";
import { updateEventAction } from "../../anniversaries/actions";

export function EditEventForm({
  anniversary,
  event,
  onDone,
}: {
  anniversary: Anniversary;
  event: AnniversaryEvent;
  onDone: () => void;
}) {
  const { t, locale } = useI18n();
  const [date, setDate] = useState(event.date);
  const [time, setTime] = useState(event.time ?? "");
  const [shared, setShared] = useState(event.shared.join(", "));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setPending(true);
    setError(null);
    const result = await updateEventAction({
      id: anniversary.id,
      eventId: event.id,
      name: anniversary.name,
      hebDateLabel: anniversary.hebDateLabel,
      date,
      time: time.trim() || undefined,
      shared: shared
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      locale,
    });
    setPending(false);
    if (!result.ok) {
      setError(
        result.error === "not-connected"
          ? t.calendar.connect.reconnect
          : result.error,
      );
      return;
    }
    onDone();
  };

  const field =
    "rounded-lg border border-foreground/20 bg-background px-2 py-1 outline-none focus:border-foreground/50";

  return (
    <div className="flex flex-col gap-3 border-t border-foreground/10 bg-foreground/5 p-3 text-xs">
      <label className="flex flex-col gap-1">
        <span>{t.calendar.events.date}</span>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={field}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span>{t.calendar.events.editTime}</span>
        <input
          value={time}
          onChange={(e) => setTime(e.target.value)}
          placeholder="HH:MM"
          className={field}
        />
        <span className="opacity-60">{t.calendar.events.editTimeHint}</span>
      </label>
      <label className="flex flex-col gap-1">
        <span>{t.calendar.events.editShared}</span>
        <input
          value={shared}
          onChange={(e) => setShared(e.target.value)}
          className={field}
        />
      </label>

      {error && <p className="text-red-500">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="rounded-lg bg-foreground px-3 py-1 font-medium text-background disabled:opacity-40"
        >
          {pending ? t.calendar.events.saving : t.calendar.events.save}
        </button>
        <button
          type="button"
          onClick={onDone}
          disabled={pending}
          className="rounded-lg border border-foreground/20 px-3 py-1"
        >
          {t.calendar.events.cancel}
        </button>
      </div>
    </div>
  );
}
