/** How each mark looks and reads (tiles, keyboard, rules page). */

import type { Mark } from "./game";

export const MARK_CLASS: Record<Mark, string> = {
  0: "bg-miss text-tile-ink",
  1: "bg-near text-tile-ink",
  2: "bg-hit text-tile-ink",
};

export const MARK_LABEL: Record<Mark, string> = {
  0: "absente",
  1: "mal placée",
  2: "bien placée",
};
