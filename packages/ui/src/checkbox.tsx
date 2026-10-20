"use client";

/**
 * HeroUI's `Checkbox`, re-exported unchanged. `@repo/ui` is the **override seam**
 * for HeroUI: apps import from `@repo/ui/*`, never `@heroui/react` directly, so
 * a component can later be wrapped, restyled or swapped here without touching
 * any call site. Styling needs `@import "@heroui/styles/css";` in the app's
 * global stylesheet (after `tailwindcss`).
 */

export { Checkbox, type CheckboxProps } from "@heroui/react/checkbox";
