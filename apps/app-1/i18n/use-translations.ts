"use client";

import { useLanguageContext } from "./language-context";
import type { Messages } from "./messages";

/**
 * The full message tree for the active language. Call this at a feature-root
 * (boundary) component, then pass the slices its children need down as `t` props.
 */
export function useTranslations(): Messages {
  return useLanguageContext().messages;
}
