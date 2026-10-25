import type { MinhagFieldTexts } from "@/app/components/anniversary/MinhagField";

/** Shared by `anniversaryForm` and `anniversaryDetail.editPersonForm`. */
export const minhagField = {
  label: "Minhag",
  sephardi: "Séfarade",
  ashkenazi: "Ashkénaze",
  hint: "Les années à deux Adar, l'azkara tombe en Adar II (séfarade) ou en Adar I (ashkénaze).",
} as const satisfies MinhagFieldTexts;
