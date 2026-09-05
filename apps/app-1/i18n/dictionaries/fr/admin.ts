import type { AdminTexts } from "@/app/admin/AdminView";

export const admin = {
  eyebrow: "Compte partagé",
  title: "Admin",
  subtitle: "Réglages du calendrier familial partagé.",
  empty: "Rien ici pour l’instant.",
} as const satisfies AdminTexts;
