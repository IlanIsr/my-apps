"use client";

export type SegmentedOption<T extends string> = { value: T; label: string };

/**
 * A small segmented control (2–3 options). Replaces a labelled on/off Switch
 * where both sides are real, named choices.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  "aria-label": ariaLabel,
  tone = "primary",
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  "aria-label": string;
  tone?: "primary" | "birthday" | "yahrzeit";
}) {
  const active =
    tone === "birthday"
      ? "text-birthday"
      : tone === "yahrzeit"
        ? "text-yahrzeit"
        : "text-foreground";

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="inline-flex w-fit self-start gap-1 rounded-field border border-border bg-sunken p-[3px] text-sm"
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={`rounded-pill px-3.5 py-1.5 font-medium whitespace-nowrap transition-colors ${
              selected
                ? `bg-card shadow-sm ${active}`
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
