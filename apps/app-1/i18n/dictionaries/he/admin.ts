import type { AdminTexts } from "@/app/admin/AdminView";

export const admin = {
  eyebrow: "חשבון משותף",
  title: "ניהול",
  subtitle: "הגדרות היומן המשפחתי המשותף.",
  empty: "עדיין אין כאן כלום.",
} as const satisfies AdminTexts;
