import type { LandingTexts } from "@/app/LandingView";

/** French UI strings — shape: {@link LandingTexts}. */
export const landing = {
  eyebrow: "Anniversaries",
  title: "Anniversaires et yahrzeits hébraïques, sur votre agenda",
  tagline:
    "Anniversaries transforme une date du calendrier hébraïque en ses prochaines dates grégoriennes et les garde sur un agenda Google partagé, pour que les anniversaires et les yahrzeits de la famille ne passent jamais inaperçus.",
  whatItDoes: {
    heading: "Ce que ça fait",
    body: "Ajoutez une personne et sa date hébraïque une seule fois. Anniversaries calcule quand cette date tombe chaque année, puis crée et met à jour les événements correspondants — la veille et à la tombée de la nuit — sur un agenda familial partagé.",
  },
  whyCalendar: {
    heading: "Pourquoi Google Agenda",
    body: "L’objectif est un vrai rappel dans l’agenda que vous utilisez déjà. Pour cela, l’application a besoin de l’autorisation de créer et de modifier les événements d’anniversaire sur l’agenda partagé, et d’ajouter comme invités les membres de la famille que vous choisissez pour que les dates apparaissent aussi chez eux.",
  },
  whoFor: {
    heading: "Pour qui",
    body: "Les familles qui marquent des dates du calendrier hébraïque — anniversaires juifs et yahrzeits (anniversaires commémoratifs) — et veulent qu’elles soient gérées une fois plutôt que recalculées chaque année.",
  },
  howToUse: {
    heading: "Comment l’utiliser",
    body: "Connectez-vous avec votre compte Google, ajoutez les dates de votre famille et choisissez avec qui partager chacune. L’application est trilingue (anglais, hébreu, français).",
  },
  signIn: "Se connecter avec Google",
  privacyLink: "Politique de confidentialité",
} as const satisfies LandingTexts;
