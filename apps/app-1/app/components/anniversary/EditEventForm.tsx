"use client";

/**
 * Inline editor for one occurrence: change its Gregorian date and/or start
 * time. Calls {@link updateEventAction}, which patches that single Google
 * Calendar event and marks it `manual` so future syncs don't recompute it.
 */

import { useState } from "react";

import { useLanguage } from "@/i18n";
import type { Anniversary, AnniversaryEvent } from "@repo/anniversaries/person";
import { updateEventAction } from "../../anniversaries/actions";
import { Button } from "../Button";
import { TextInput } from "../TextInput";

/** Text for {@link EditEventForm}. */
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

  return (
    <div className="flex flex-col gap-3 border-t border-hairline bg-sunken p-3.5 text-xs">
      <label className="flex flex-col gap-1">
        <span className="text-subtle-foreground">{t.date}</span>
        <TextInput
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-subtle-foreground">{t.time}</span>
        <TextInput
          value={time}
          onChange={(e) => setTime(e.target.value)}
          placeholder="HH:MM"
        />
        <span className="text-subtle-foreground">{t.timeHint}</span>
      </label>

      {error && <p className="text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button onClick={save} disabled={pending} size="sm">
          {pending ? t.saving : t.save}
        </Button>
        <Button onClick={onDone} disabled={pending} variant="outline" size="sm">
          {t.cancel}
        </Button>
      </div>
    </div>
  );
}
