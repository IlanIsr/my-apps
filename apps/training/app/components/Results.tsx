"use client";

/**
 * The three manual results: the picker used while correcting, and the
 * stacked bar that summarises a set of results.
 */

import { ToggleButton } from "@repo/ui/toggle-button";

import {
  RESULT_STATUSES,
  type ResultCounts,
  type ResultStatus,
} from "@/lib/exam-logic";

export type ResultTexts = Record<ResultStatus | "unrated", string>;

const MARK: Record<ResultStatus, string> = {
  correct: "✓",
  partial: "½",
  incorrect: "✗",
};

const TONE: Record<ResultStatus, { on: string; bar: string }> = {
  correct: { on: "border-ok bg-ok-soft text-ok", bar: "bg-ok" },
  partial: { on: "border-part bg-part-soft text-part", bar: "bg-part" },
  incorrect: { on: "border-ko bg-ko-soft text-ko", bar: "bg-ko" },
};

/** Three HeroUI toggle buttons; tapping the selected one clears it. */
export function ResultPicker({
  value,
  onChange,
  disabled,
  t,
  label,
}: {
  value: ResultStatus | undefined;
  onChange: (status: ResultStatus | null) => void;
  disabled?: boolean;
  t: ResultTexts;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {RESULT_STATUSES.map((status) => {
        const on = value === status;
        return (
          <ResultChip
            key={status}
            on={on}
            disabled={disabled}
            className={on ? TONE[status].on : ""}
            onClick={() => onChange(on ? null : status)}
          >
            <span aria-hidden className="font-mono text-base leading-none">
              {MARK[status]}
            </span>
            {t[status]}
          </ResultChip>
        );
      })}
    </div>
  );
}

function ResultChip({
  on,
  disabled,
  className,
  onClick,
  children,
}: {
  on: boolean;
  disabled?: boolean;
  className: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <ToggleButton
      isSelected={on}
      isDisabled={disabled}
      onChange={onClick}
      size="sm"
      className={`gap-1.5 border border-line ${className}`}
    >
      {children}
    </ToggleButton>
  );
}

/** Correct / partial / incorrect as one proportional bar (unrated = track). */
export function ResultBar({
  counts,
  className = "",
}: {
  counts: ResultCounts;
  className?: string;
}) {
  const total =
    counts.correct + counts.partial + counts.incorrect + counts.unrated;
  return (
    <div
      aria-hidden
      className={`flex h-1.5 overflow-hidden rounded-full bg-sunken ${className}`}
    >
      {total > 0 &&
        RESULT_STATUSES.map((status) => (
          <div
            key={status}
            className={TONE[status].bar}
            style={{ width: `${(counts[status] / total) * 100}%` }}
          />
        ))}
    </div>
  );
}

export function ResultMark({ status }: { status: ResultStatus | undefined }) {
  if (!status) return null;
  return (
    <span
      className={`grid size-7 shrink-0 place-items-center rounded-full border font-mono ${TONE[status].on}`}
    >
      {MARK[status]}
    </span>
  );
}
