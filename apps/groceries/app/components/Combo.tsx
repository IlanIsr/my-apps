"use client";

/**
 * A free-text field with suggestions — HeroUI's `ComboBox` (via
 * `@repo/ui/combo-box`) with `allowsCustomValue`. Controlled by its text;
 * `onPick` fires when a suggestion is chosen (with its key).
 */

import { ComboBox } from "@repo/ui/combo-box";
import { Input } from "@repo/ui/input";
import { ListBox } from "@repo/ui/list-box";

import type { Option } from "./Select";

export function Combo({
  value,
  onChange,
  options,
  onPick,
  placeholder,
  "aria-label": ariaLabel,
  className,
}: {
  value: string;
  onChange: (text: string) => void;
  options: Option[];
  onPick?: (key: string) => void;
  placeholder?: string;
  "aria-label": string;
  className?: string;
}) {
  const query = value.trim().toLowerCase();
  const shown = (
    query
      ? options.filter((o) => o.label.toLowerCase().includes(query))
      : options
  ).slice(0, 50);

  return (
    <ComboBox
      aria-label={ariaLabel}
      allowsCustomValue
      allowsEmptyCollection
      menuTrigger="input"
      inputValue={value}
      onInputChange={onChange}
      onSelectionChange={(key) => {
        if (key === null) return;
        const option = options.find((o) => o.key === String(key));
        if (option) onChange(option.label);
        onPick?.(String(key));
      }}
      items={shown}
      className={`min-w-0 ${className ?? ""}`}
      fullWidth
    >
      <ComboBox.InputGroup>
        <Input placeholder={placeholder} />
        <ComboBox.Trigger />
      </ComboBox.InputGroup>
      <ComboBox.Popover>
        <ListBox>
          {(option: Option) => (
            <ListBox.Item id={option.key} textValue={option.label}>
              {option.label}
            </ListBox.Item>
          )}
        </ListBox>
      </ComboBox.Popover>
    </ComboBox>
  );
}
