"use client";

/**
 * app-1's multi-line text field — HeroUI's `TextArea` (via `@repo/ui`). Same
 * props as a native `<textarea>`.
 */

import {
  TextArea as HeroTextArea,
  type TextAreaProps,
} from "@repo/ui/text-area";

export function TextArea(props: TextAreaProps) {
  return <HeroTextArea fullWidth {...props} />;
}
