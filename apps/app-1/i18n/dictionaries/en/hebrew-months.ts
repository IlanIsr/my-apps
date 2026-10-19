import type { HebrewMonthKey } from "@repo/hebcal";

/**
 * Hebrew month names, shared by every feature that needs a month picker
 * (`converter`, `anniversaryForm`, `anniversaryDetail.editPersonForm`) —
 * single source so the three stay in sync.
 */
export const hebrewMonths = {
  Tishrei: "Tishrei",
  Cheshvan: "Cheshvan",
  Kislev: "Kislev",
  Tevet: "Tevet",
  Shvat: "Shvat",
  Adar: "Adar",
  Adar1: "Adar I",
  Adar2: "Adar II",
  Nisan: "Nisan",
  Iyyar: "Iyar",
  Sivan: "Sivan",
  Tamuz: "Tamuz",
  Av: "Av",
  Elul: "Elul",
} as const satisfies Record<HebrewMonthKey, string>;
