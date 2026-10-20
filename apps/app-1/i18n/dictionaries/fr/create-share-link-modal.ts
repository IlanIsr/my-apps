import type { CreateShareLinkModalTexts } from "@/app/components/anniversary/CreateShareLinkModal";

/**
 * French UI strings — shape: {@link CreateShareLinkModalTexts}. Partagé par
 * `anniversaries.ts` ("Share my list") et `anniversary-detail.ts` ("Share
 * this one") — même modale, deux points d'appel.
 */
export const createShareLinkModal = {
  title: "Partager un lien",
  intro:
    "Choisissez les anniversaires à inclure. Celui qui ouvre le lien décide lesquels rejoindre — on ne vous demande jamais l’email de personne.",
  selectAll: "Tout sélectionner",
  clearAll: "Tout désélectionner",
  generate: "Générer le lien",
  generating: "Génération…",
  cancel: "Annuler",
  copy: "Copier",
  copied: "Copié !",
  linkIntro: "Partagez ce lien avec qui vous voulez :",
  expiresIn:
    "Expire dans 24 heures. Tout le monde peut l’ouvrir et rejoindre jusque-là.",
  nothingSelected: "Choisissez au moins un anniversaire.",
  error: (message: string) => `Une erreur est survenue : ${message}`,
} as const satisfies CreateShareLinkModalTexts;
