"use client";

/**
 * Panini's button — HeroUI's `Button` (via `@repo/ui/button`), themed through
 * the HeroUI variables in `globals.css`. Keeps a DOM-like API (`onClick`,
 * `disabled`) so call sites read like plain buttons.
 */

import {
  Button as HeroButton,
  type ButtonProps as HeroButtonProps,
} from "@repo/ui/button";

type Props = Omit<
  HeroButtonProps,
  "variant" | "size" | "onPress" | "isDisabled" | "className"
> & {
  /** `"outline"` (default), `"primary"`, `"danger"` or `"ghost"`. */
  variant?: "outline" | "primary" | "danger" | "ghost";
  size?: "sm" | "md";
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
};

export function Button({
  variant = "outline",
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
