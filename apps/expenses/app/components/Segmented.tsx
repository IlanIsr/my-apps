"use client";

import { ToggleButton } from "@repo/ui/toggle-button";
import { ToggleButtonGroup } from "@repo/ui/toggle-button-group";

export type SegmentedOption<T extends string> = { value: T; label: string };

/**
 * A small segmented control (2–4 options) — HeroUI's `ToggleButtonGroup` in
 * single-selection mode (via `@repo/ui`).
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  "aria-label": ariaLabel,
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  "aria-label": string;
}) {
  return (
    <ToggleButtonGroup
      aria-label={ariaLabel}
      selectionMode="single"
      disallowEmptySelection
      selectedKeys={[value]}
      onSelectionChange={(keys) => {
        const [key] = keys;
        if (key !== undefined) onChange(String(key) as T);
      }}
      size="sm"
      className="w-fit max-w-full self-start"
    >
      {options.map((option) => (
        <ToggleButton
          key={option.value}
          id={option.value}
          className="whitespace-nowrap"
        >
          {option.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
