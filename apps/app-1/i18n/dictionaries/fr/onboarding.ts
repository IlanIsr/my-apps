import type { OnboardingTexts } from "@/app/components/OnboardingModal";

/** French UI strings — shape: {@link OnboardingTexts}. */
export const onboarding = {
  title: "Bienvenue !",
  intro: "Quelques réglages vous attendent dans votre profil :",
  items: [
    {
      title: "Ville",
      text: "vos événements commencent à la tombée de la nuit là où vous habitez (Jérusalem par défaut).",
    },
    {
      title: "Minhag",
      text: "séfarade ou ashkénaze : le vocabulaire, et l'Adar retenu par défaut les années à deux Adar.",
    },
    {
      title: "Calendrier Apple / Outlook",
      text: "un lien pour vous abonner depuis n'importe quel agenda.",
    },
    {
      title: "Import CSV",
      text: "ajoutez vos anniversaires depuis un export Hebcal.",
    },
  ],
  openProfile: "Ouvrir mon profil",
  later: "Plus tard",
} as const satisfies OnboardingTexts;
