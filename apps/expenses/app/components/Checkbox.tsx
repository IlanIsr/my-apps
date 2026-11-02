"use client";

import type { ReactNode } from "react";

import { Checkbox as HeroCheckbox } from "@repo/ui/checkbox";

/**
 * A checkbox with its label — HeroUI's `Checkbox` (via `@repo/ui/checkbox`).
 * The whole row (box + `children`, styled by `className`) toggles it.
 */
export function Checkbox({
  checked,
  onChange,
  children,
  className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <HeroCheckbox isSelected={checked} onChange={onChange}>
      <HeroCheckbox.Content className={className}>
        <HeroCheckbox.Control>
          <HeroCheckbox.Indicator />
        </HeroCheckbox.Control>
        {children}
      </HeroCheckbox.Content>
    </HeroCheckbox>
  );
}
