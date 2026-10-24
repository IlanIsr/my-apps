"use client";

import type { Minhag } from "@repo/hebcal";

import { Segmented } from "../Segmented";

/** Text for {@link MinhagField}. */
export type MinhagFieldTexts = {
  label: string;
  sephardi: string;
  ashkenazi: string;
  /** Explains what the choice changes. */
  hint: string;
};

/**
 * Sephardi / Ashkenazi switch for a yahrzeit in a single Adar — decides whether
 * it falls in Adar II or Adar I of a leap year. Only shown in that case.
 */
export function MinhagField({
  t,
  value,
  onChange,
  labelClassName,
}: {
  t: MinhagFieldTexts;
  value: Minhag;
  onChange: (value: Minhag) => void;
  labelClassName: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className={labelClassName}>{t.label}</span>
      <Segmented
        aria-label={t.label}
        tone="yahrzeit"
        value={value}
        onChange={onChange}
        options={[
          { value: "sephardi", label: t.sephardi },
          { value: "ashkenazi", label: t.ashkenazi },
        ]}
      />
      <p className="text-xs text-muted-foreground">{t.hint}</p>
    </div>
  );
}
