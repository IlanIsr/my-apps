import type { CSSProperties } from "react";

/** Inline vars that point the `kc` / `kc-soft` utilities at a collector colour. */
export function collectorStyle(color: string): CSSProperties {
  return {
    "--kc": `var(--c-${color})`,
    "--kc-soft": `var(--c-${color}-soft)`,
  } as CSSProperties;
}
