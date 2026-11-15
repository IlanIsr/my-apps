"use client";

/**
 * Picks a passage of the Shass: a masekhet, then the whole of it, one perek,
 * or a from / to amud range. Used by the plan form and the note form.
 */

import { useSyncExternalStore } from "react";

import {
  amudim,
  amudLabel,
  localToday,
  masekhetOf,
  rangeLabel,
  type Masekhet,
} from "@/lib/study-logic";
import { SHASS } from "@/lib/shass";

import { Select } from "./Select";

export type PassagePickerTexts = {
  masekhet: string;
  portion: string;
  whole: string;
  custom: string;
  perek: string;
  from: string;
  to: string;
};

export type Passage = { book: string; startAmud: number; endAmud: number };

export function wholeMasekhet(m: Masekhet): Passage {
  return { book: m.key, startAmud: m.first, endAmud: m.last };
}

const noop = () => () => {};

/**
 * Today in the browser's time zone — `null` while server-rendering, so a
 * server in another zone never renders the wrong day.
 */
export function useToday(): string | null {
  return useSyncExternalStore(noop, localToday, () => null);
}

/** `"mar. 18 nov."`-style label for a `"YYYY-MM-DD"` day. */
export function formatDay(
  iso: string,
  tag: string,
  options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    day: "numeric",
    month: "short",
  },
): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(tag, {
    ...options,
    timeZone: "UTC",
  });
}

export function PassagePicker({
  value,
  onChange,
  hebrew,
  t,
}: {
  value: Passage;
  onChange: (value: Passage) => void;
  hebrew: boolean;
  t: PassagePickerTexts;
}) {
  const m = masekhetOf(value.book) ?? SHASS[0]!;
  const perekIndex = m.perakim.findIndex(
    (p) => p.start === value.startAmud && p.end === value.endAmud,
  );
  const portion =
    value.startAmud === m.first && value.endAmud === m.last
      ? "whole"
      : perekIndex >= 0
        ? String(perekIndex)
        : "custom";

  const amudOptions = amudim(m.first, m.last).map((a) => ({
    key: String(a),
    label: amudLabel(a, hebrew),
  }));

  return (
    <div className="space-y-3">
      <label className="block space-y-1.5">
        <span className="text-sm font-medium">{t.masekhet}</span>
        <Select
          aria-label={t.masekhet}
          options={SHASS.map((s) => ({
            key: s.key,
            label: hebrew ? s.he : `${s.key} · ${s.he}`,
          }))}
          value={m.key}
          onChange={(key) => onChange(wholeMasekhet(masekhetOf(key)!))}
          className="w-full"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium">{t.portion}</span>
        <Select
          aria-label={t.portion}
          options={[
            {
              key: "whole",
              label: `${t.whole} (${rangeLabel(m.first, m.last, hebrew)})`,
            },
            ...m.perakim.map((p, i) => ({
              key: String(i),
              label: `${t.perek} ${i + 1} — ${p.he} (${rangeLabel(p.start, p.end, hebrew)})`,
            })),
            ...(portion === "custom"
              ? [{ key: "custom", label: t.custom }]
              : []),
          ]}
          value={portion}
          onChange={(key) => {
            if (key === "whole") onChange(wholeMasekhet(m));
            const p = m.perakim[Number(key)];
            if (p)
              onChange({ book: m.key, startAmud: p.start, endAmud: p.end });
          }}
          className="w-full"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">{t.from}</span>
          <Select
            aria-label={t.from}
            options={amudOptions}
            value={String(value.startAmud)}
            onChange={(key) => {
              const start = Number(key);
              onChange({
                ...value,
                startAmud: start,
                endAmud: Math.max(start, value.endAmud),
              });
            }}
            className="w-full"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">{t.to}</span>
          <Select
            aria-label={t.to}
            options={amudOptions.filter(
              (o) => Number(o.key) >= value.startAmud,
            )}
            value={String(value.endAmud)}
            onChange={(key) => onChange({ ...value, endAmud: Number(key) })}
            className="w-full"
          />
        </label>
      </div>
    </div>
  );
}
