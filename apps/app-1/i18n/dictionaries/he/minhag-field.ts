import type { MinhagFieldTexts } from "@/app/components/anniversary/MinhagField";

/** Shared by `anniversaryForm` and `anniversaryDetail.editPersonForm`. */
export const minhagField = {
  label: "מנהג",
  sephardi: "ספרדי",
  ashkenazi: "אשכנזי",
  hint: "בשנה מעוברת, האזכרה חלה באדר ב׳ (ספרדי) או באדר א׳ (אשכנזי).",
} as const satisfies MinhagFieldTexts;
