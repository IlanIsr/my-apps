import type { ProfileTexts } from "@/app/profile/ProfileView";

export const profile = {
  title: "Profil",
  intro: "Vos préférences pour l'application.",
  minhag: {
    title: "Minhag",
    sephardi: "Séfarade",
    ashkenazi: "Ashkénaze",
    hint: "Séfarade : « Azkara », et Adar II par défaut les années à deux Adar. Ashkénaze : « Yortzeit », et Adar I par défaut.",
  },
  saved: "Enregistré.",
  error: "Impossible d'enregistrer. Réessayez.",
} as const satisfies ProfileTexts;
