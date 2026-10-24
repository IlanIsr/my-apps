import type { MinhagFieldTexts } from "@/app/components/anniversary/MinhagField";

/** Shared by `anniversaryForm` and `anniversaryDetail.editPersonForm`. */
export const minhagField = {
  label: "Custom",
  sephardi: "Sephardi",
  ashkenazi: "Ashkenazi",
  hint: "In a year with two Adars, the yahrzeit falls in Adar II (Sephardi) or Adar I (Ashkenazi).",
} as const satisfies MinhagFieldTexts;
