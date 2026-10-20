"use client";

/**
 * app-1's text field — HeroUI's `Input` (via `@repo/ui/input`). Takes the same
 * props as a native `<input>` (`value`, `onChange`, `type`, `dir`, …); the
 * look comes from HeroUI, themed in `globals.css`.
 */

import { Input, type InputProps } from "@repo/ui/input";

export function TextInput(props: InputProps) {
  return <Input fullWidth {...props} />;
}
