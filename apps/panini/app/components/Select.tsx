"use client";

import { ListBox } from "@repo/ui/list-box";
import { Select as HeroSelect } from "@repo/ui/select";

/** One option: a stable `key` (the value) and its display `label`. */
export type Option = { key: string; label: string };

/**
 * A compact dropdown — HeroUI's `Select` (via `@repo/ui/select`). Controlled:
 * the parent holds `value` and updates it from `onChange`.
 */
export function Select({
  options,
  value,
  onChange,
  "aria-label": ariaLabel,
  className,
}: {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  "aria-label": string;
  className?: string;
}) {
  return (
    <HeroSelect
      value={value}
      onChange={(key) => key !== null && onChange(String(key))}
      aria-label={ariaLabel}
      className={className}
    >
      <HeroSelect.Trigger>
        <HeroSelect.Value />
        <HeroSelect.Indicator />
      </HeroSelect.Trigger>
      <HeroSelect.Popover>
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
