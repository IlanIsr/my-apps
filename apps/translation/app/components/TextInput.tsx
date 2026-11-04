"use client";

/**
 * Training's text field — HeroUI's `Input` (via `@repo/ui/input`). Same props as
 * a native `<input>` (`name`, `defaultValue`, `value`, `onChange`, `type`, …),
 * so uncontrolled forms read through `FormData` keep working. Like `TextArea`,
 * an empty `dir="auto"` field inherits the page direction (placeholder side).
 */

import { Input, type InputProps } from "@repo/ui/input";

export function TextInput({ dir, ...props }: InputProps) {
  return (
    <Input
      fullWidth
      {...props}
      dir={dir === "auto" && !props.value ? undefined : dir}
    />
  );
}
