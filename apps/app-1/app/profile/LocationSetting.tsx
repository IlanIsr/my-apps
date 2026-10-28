"use client";

/**
 * Profile card: the user's reference city — the timezone of their calendar
 * events and where nightfall / sunset are computed. Saving it
 * ({@link saveLocationAction}) then moves them, one anniversary at a time
 * ({@link moveSeriesAction}), to that city's calendar series: a new Google
 * invite per anniversary. Never chosen → preselects the browser's timezone
 * when a city matches it, else Jerusalem.
 */

import { useRouter } from "next/navigation";
import { useMemo, useState, useSyncExternalStore } from "react";

import {
  DEFAULT_LOCATION,
  LOCATION_IDS,
  locationForTimezone,
  type LocationId,
} from "@repo/hebcal";
import { useLanguage } from "@/i18n";
import { Button } from "../components/Button";
import { Select } from "../components/Select";
import { moveSeriesAction, saveLocationAction } from "./actions";

/** Text for {@link LocationSetting}. */
export type LocationSettingTexts = {
  title: string;
  hint: string;
  label: string;
  cities: Record<LocationId, string>;
  /** Shown while the city was never saved (the preselection is a guess). */
  notSaved: string;
  save: string;
  moving: (done: number, total: number) => string;
  done: string;
  rateLimited: string;
  error: string;
};

const noSubscribe = () => () => {};

function browserLocation(): LocationId {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return locationForTimezone(zone) ?? DEFAULT_LOCATION;
  } catch {
    return DEFAULT_LOCATION;
  }
}

export function LocationSetting({ t }: { t: LocationSettingTexts }) {
  const { location: saved, locale } = useLanguage();
  const router = useRouter();
  // The browser's timezone only exists client-side (server render: default).
  const detected = useSyncExternalStore(
    noSubscribe,
    browserLocation,
    () => DEFAULT_LOCATION,
  );
  const [picked, setPicked] = useState<LocationId | null>(null);
  const location = picked ?? saved ?? detected;
  const [progress, setProgress] = useState<[number, number] | null>(null);
  const [status, setStatus] = useState<
    "done" | "rate-limited" | "error" | null
  >(null);

  const options = useMemo(
    () =>
      LOCATION_IDS.map((id) => ({ key: id, label: t.cities[id] })).sort(
        (a, b) => a.label.localeCompare(b.label, locale),
      ),
    [t.cities, locale],
  );

  const pending = progress !== null;
  // A failed move leaves the save button up, so it can be retried.
  const dirty = location !== saved || (status !== null && status !== "done");

  const save = async () => {
    setStatus(null);
    setProgress([0, 0]);
    const result = await saveLocationAction(location);
    if (!result.ok) {
      setProgress(null);
      setStatus("error");
      return;
    }
    const ids = result.personIds;
    for (const [i, id] of ids.entries()) {
      setProgress([i, ids.length]);
      const moved = await moveSeriesAction(id);
      if (!moved.ok) {
        setProgress(null);
        setStatus(moved.error === "rate-limited" ? "rate-limited" : "error");
        router.refresh();
        return;
      }
    }
    setProgress(null);
    setStatus("done");
    router.refresh();
  };

  const label =
    "font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-subtle-foreground";

  return (
    <section className="flex flex-col gap-3 rounded-card border border-border bg-card p-5">
      <span className={label}>{t.title}</span>
      <div className="flex flex-wrap items-end gap-3">
        <Select
          label={t.label}
          hideLabel
          options={options}
          value={location}
          onChange={(v) => setPicked(v as LocationId)}
          className="flex min-w-48 flex-col gap-1.5 text-sm"
        />
        {dirty && (
          <Button onClick={save} disabled={pending}>
            {progress ? t.moving(progress[0], progress[1]) : t.save}
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{t.hint}</p>
      {saved === null && !pending && status === null && (
        <p className="text-xs text-subtle-foreground">{t.notSaved}</p>
      )}
      {status === "done" && <p className="text-xs">{t.done}</p>}
      {status === "rate-limited" && (
        <p className="text-xs text-destructive">{t.rateLimited}</p>
      )}
      {status === "error" && (
        <p className="text-xs text-destructive">{t.error}</p>
      )}
    </section>
  );
}
