"use client";

import type { ReactNode } from "react";

import { Switch as HeroSwitch } from "@repo/ui/switch";

/**
 * An on/off toggle with its label — HeroUI's `Switch` (via `@repo/ui/switch`).
 * The whole row (track + `children`) toggles it.
 */
export function Switch({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
}) {
  return (
    <HeroSwitch isSelected={checked} onChange={onChange}>
      <HeroSwitch.Content className="gap-2.5 text-sm font-medium">
        <HeroSwitch.Control>
          <HeroSwitch.Thumb />
        </HeroSwitch.Control>
        {children}
      </HeroSwitch.Content>
    </HeroSwitch>
  );
}
