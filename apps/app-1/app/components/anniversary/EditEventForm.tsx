"use client";

import { useState } from "react";

import { useLanguage } from "@/i18n";
import type { Anniversary, AnniversaryEvent } from "@repo/anniversaries";
import { updateEventAction } from "../../anniversaries/actions";

export type EditEventFormTexts = {
  date: string;
  time: string;
  timeHint: string;
  save: string;
  saving: string;
  cancel: string;
  error: (message: string) => string;
};

export function EditEventForm({
  anniversary,
  event,
  t,
  onDone,
}: {
  anniversary: Anniversary;
  event: AnniversaryEvent;
  t: EditEventFormTexts;
  onDone: () => void;
}) {
  const { locale } = useLanguage();
  const [date, setDate] = useState(event.date);
  const [time, setTime] = useState(event.time ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setPending(true);
    setError(null);
    const result = await updateEventAction({
      id: anniversary.id,
      eventId: event.id,
      name: anniversary.name,
      type: anniversary.type,
      hebDateLabel: anniversary.hebDateLabel,
      date,
      time: time.trim() || undefined,
      locale,
    });
    setPending(false);
    if (!result.ok) {
      setError(t.error(result.error));
      return;
    }
    onDone();
  };

  const field =
    "rounded-pill border border-border bg-card px-2.5 py-1.5 outline-none focus:border-ring focus:ring-2 focus:ring-ring/20";

  return (
    <div className="flex flex-col gap-3 border-t border-hairline bg-sunken p-3.5 text-xs">
      <label className="flex flex-col gap-1">
        <span className="text-subtle-foreground">{t.date}</span>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={field}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-subtle-foreground">{t.time}</span>
        <input
          value={time}
          onChange={(e) => setTime(e.target.value)}
          placeholder="HH:MM"
          className={field}
        />
        <span className="text-subtle-foreground">{t.timeHint}</span>
      </label>

      {error && <p className="text-destructive">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="rounded-pill bg-primary px-3 py-1.5 font-semibold text-primary-foreground disabled:opacity-40"
        >
          {pending ? t.saving : t.save}
        </button>
        <button
          type="button"
          onClick={onDone}
          disabled={pending}
          className="rounded-pill border border-border px-3 py-1.5"
        >
          {t.cancel}
        </button>
      </div>
    </div>
  );
}
