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
      className={className}
      aria-label={hideLabel ? label : undefined}
    >
      {!hideLabel && (
        <Label className="font-mono text-[10.5px] font-medium tracking-[0.12em] text-subtle-foreground uppercase">
          {label}
        </Label>
      )}
      <HeroSelect.Trigger>
        <HeroSelect.Value />
        <HeroSelect.Indicator />
      </HeroSelect.Trigger>
      {/* Size to the options (≥ the trigger), so a compact trigger doesn't
          squeeze the selected-item checkmark onto the label. */}
      <HeroSelect.Popover className="w-max">
        <ListBox>
          {options.map((option) => (
            <ListBox.Item
              key={option.key}
              id={option.key}
              textValue={option.label}
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
