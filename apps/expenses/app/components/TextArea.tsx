"use client";

/**
 * Expenses' multi-line text field — HeroUI's `TextArea` (via `@repo/ui`). Same
 * props as a native `<textarea>`. Free text: once something is typed its
 * direction follows it (`dir="auto"`), so a Hebrew note reads RTL in a French /
 * English UI; empty, it keeps the page's direction (the caret starts on the
 * right in Hebrew — `dir="auto"` alone would put it on the left).
 */

import {
  TextArea as HeroTextArea,
  type TextAreaProps,
} from "@repo/ui/text-area";

export function TextArea(props: TextAreaProps) {
  return <HeroTextArea fullWidth dir={autoDir(props.value)} {...props} />;
}

/** `dir` for a free-text field: `"auto"` once it has text, else inherited. */
export function autoDir(value: unknown): "auto" | undefined {
  return typeof value === "string" && value.trim() ? "auto" : undefined;
}
