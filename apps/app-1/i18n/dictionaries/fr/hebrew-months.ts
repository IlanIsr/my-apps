import type { HebrewMonthKey } from "@repo/hebcal";

/**
 * Hebrew month names, shared by every feature that needs a month picker
 * (`converter`, `anniversaryForm`, `anniversaryDetail.editPersonForm`) —
 * single source so the three stay in sync.
 */
export const hebrewMonths = {
  Tishrei: "Tichri",
  Cheshvan: "Hechvan",
  Kislev: "Kislev",
  Tevet: "Tévet",
  Shvat: "Chevat",
  Adar: "Adar",
  Adar1: "Adar I",
  Adar2: "Adar II",
  Nisan: "Nissan",
  Iyyar: "Iyar",
  Sivan: "Sivan",
  Tamuz: "Tamouz",
  Av: "Av",
  Elul: "Eloul",
} as const satisfies Record<HebrewMonthKey, string>;
