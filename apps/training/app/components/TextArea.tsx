"use client";

/**
 * Training's multi-line text field — HeroUI's `TextArea` (via `@repo/ui`). Same
 * props as a native `<textarea>`. `dir="auto"` only applies once there's text:
 * an empty field would resolve to LTR and put the placeholder on the wrong
 * side in Hebrew, so it inherits the page direction until then.
 */

import {
  TextArea as HeroTextArea,
  type TextAreaProps,
} from "@repo/ui/text-area";

export function TextArea({ dir, ...props }: TextAreaProps) {
  return (
    <HeroTextArea
      fullWidth
      {...props}
      dir={dir === "auto" && !props.value ? undefined : dir}
    />
  );
}
