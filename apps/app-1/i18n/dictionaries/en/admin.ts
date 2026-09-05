import type { AdminTexts } from "@/app/admin/AdminView";

export const admin = {
  eyebrow: "Shared account",
  title: "Admin",
  subtitle: "Settings for the shared family calendar.",
  empty: "Nothing here yet.",
} as const satisfies AdminTexts;
