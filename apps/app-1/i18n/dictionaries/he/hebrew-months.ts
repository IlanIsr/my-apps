import type { HebrewMonthKey } from "@repo/hebcal";

/**
 * Hebrew month names, shared by every feature that needs a month picker
 * (`converter`, `anniversaryForm`, `anniversaryDetail.editPersonForm`) —
 * single source so the three stay in sync.
 */
export const hebrewMonths = {
  Tishrei: "תשרי",
  Cheshvan: "חשוון",
  Kislev: "כסלו",
  Tevet: "טבת",
  Shvat: "שבט",
  Adar: "אדר",
  Adar1: "אדר א׳",
  Adar2: "אדר ב׳",
  Nisan: "ניסן",
  Iyyar: "אייר",
  Sivan: "סיוון",
  Tamuz: "תמוז",
  Av: "אב",
  Elul: "אלול",
} as const satisfies Record<HebrewMonthKey, string>;
