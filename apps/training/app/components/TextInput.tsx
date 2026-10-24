"use client";

/**
 * Training's text field — HeroUI's `Input` (via `@repo/ui/input`). Same props as
 * a native `<input>` (`name`, `defaultValue`, `value`, `onChange`, `type`, …),
 * so uncontrolled forms read through `FormData` keep working.
 */

import { Input, type InputProps } from "@repo/ui/input";

export function TextInput(props: InputProps) {
  return <Input fullWidth {...props} />;
}
