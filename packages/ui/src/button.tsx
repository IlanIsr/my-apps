"use client";

import { ReactNode } from "react";

/** Props for {@link Button}. */
interface ButtonProps {
  children: ReactNode;
  className?: string;
  /** App name echoed in the demo `alert()`. */
  appName: string;
}

/**
 * Starter button from the Turborepo template — kept as-is on purpose (see
 * CLAUDE.md: do not redesign `@repo/ui`). Real app-1 buttons live in
 * `apps/app-1/app/components/Button.tsx`.
 */
export const Button = ({ children, className, appName }: ButtonProps) => {
  return (
    <button
      className={className}
      onClick={() => alert(`Hello from your ${appName} app!`)}
    >
      {children}
    </button>
  );
};
