"use client";

/**
 * React Aria's `I18nProvider` (as re-exported by HeroUI). HeroUI components
 * take their locale — and so their reading direction (popovers, list items,
 * checkmarks…) — from it, not from `<html dir>`. An app with its own language
 * switch wraps its tree in this with the active locale, e.g. `"he-IL"`.
 */

export { I18nProvider } from "@heroui/react/rac";
