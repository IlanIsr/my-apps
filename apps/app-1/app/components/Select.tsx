"use client";

import { Label } from "@repo/ui/label";
import { ListBox } from "@repo/ui/list-box";
import { Select as HeroSelect } from "@repo/ui/select";

/** One option: a stable `key` (the stored value) and its display `label`. */
export type Option = { key: string; label: string };

type Props = {
  /** Visible label — mono uppercase, or screen-reader only with `hideLabel`. */
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  /** Keep the label for screen readers only (e.g. a compact header control). */
  hideLabel?: boolean;
  className?: string;
};

/**
 * A labelled dropdown — HeroUI's `Select` (via `@repo/ui/select`). Controlled:
 * the parent holds `value` and updates it from `onChange`.
 */
export function Select({
  label,
  options,
  value,
  onChange,
  hideLabel,
  className = "flex flex-col gap-1.5 text-sm",
}: Props) {
  return (
    <HeroSelect
      value={value}
      onChange={(key) => key !== null && onChange(String(key))}
      // `min-w-0`: in a flex row, shrink to its basis instead of the label width.
      className={`min-w-0 ${className}`}
      aria-label={hideLabel ? label : undefined}
    >
      {!hideLabel && (
        <Label className="font-mono text-[10.5px] font-medium tracking-[0.12em] text-subtle-foreground uppercase">
          {label}
        </Label>
      )}
      <HeroSelect.Trigger>
        {/* One line, ellipsis — a long label must not wrap the trigger. */}
        <HeroSelect.Value className="min-w-0 truncate" />
        <HeroSelect.Indicator />
      </HeroSelect.Trigger>
      <HeroSelect.Popover>
        <ListBox>
          {options.map((option) => (
            <ListBox.Item
              key={option.key}
              id={option.key}
              textValue={option.label}
              // HeroUI leaves only ~4px between the longest label and the
              // checkmark (pe-7 with the mark at end-2) — give it room.
              className="pe-10"
            >
              {option.label}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </HeroSelect.Popover>
    </HeroSelect>
  );
}
