"use client";

/**
 * app-1's button — HeroUI's `Button` (via `@repo/ui/button`), themed to the
 * parchment/ink palette through the HeroUI variables in `globals.css`. Keeps a
 * DOM-like API (`onClick`, `disabled`) so call sites read like plain buttons.
 */

import {
  Button as HeroButton,
  type ButtonProps as HeroButtonProps,
} from "@repo/ui/button";

type Props = Omit<
  HeroButtonProps,
  "variant" | "size" | "onPress" | "isDisabled" | "className"
> & {
  /** `"primary"` (default), `"outline"` or `"ghost"`. */
  variant?: "primary" | "outline" | "ghost";
  /** `"md"` (default) or `"sm"` for compact pill buttons. */
  size?: "sm" | "md";
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
};

export function Button({
  variant = "primary",
  size = "md",
  disabled,
  onClick,
  ...props
}: Props) {
  return (
    <HeroButton
      {...props}
      variant={variant}
      size={size}
      isDisabled={disabled}
      onPress={onClick}
    />
  );
}
