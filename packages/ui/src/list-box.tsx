"use client";

/**
 * HeroUI's `ListBox`, re-exported unchanged. `@repo/ui` is the **override seam**
 * for HeroUI: apps import from `@repo/ui/*`, never `@heroui/react` directly, so
 * a component can later be wrapped, restyled or swapped here without touching
 * any call site. Styling needs `@import "@heroui/styles/css";` in the app's
 * global stylesheet (after `tailwindcss`).
 */

export { ListBox, type ListBoxProps } from "@heroui/react/list-box";
