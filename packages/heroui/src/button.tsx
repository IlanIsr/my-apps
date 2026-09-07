"use client";

/**
 * HeroUI's `Button`, re-exported unchanged.
 *
 * This package is the **override seam** for the HeroUI library: apps import
 * components from `@repo/heroui/*`, never from `@heroui/react` directly, so the
 * implementation can later be wrapped, restyled, or swapped here without
 * touching any call site.
 *
 * HeroUI v3 ships prebuilt CSS — an app must `@import "@heroui/styles";` in its
 * global stylesheet (after `tailwindcss`) for these components to be styled.
 */

export { Button, type ButtonProps } from "@heroui/react/button";
