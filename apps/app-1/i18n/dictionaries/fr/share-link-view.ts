import type { ShareLinkViewTexts } from "@/app/anniversaries/share/[id]/ShareLinkView";

/** French UI strings — shape: {@link ShareLinkViewTexts}. */
export const shareLinkView = {
  title: "Rejoindre ces anniversaires ?",
  intro:
    "Choisissez ceux que vous voulez rejoindre — vous serez ajouté à chacun et recevrez une invitation agenda.",
  expiredTitle: "Ce lien a expiré",
  expiredBody:
    "Les liens de partage ne durent que 24 heures. Demandez-en un nouveau.",
  backToList: "Retour à ma liste",
  alreadyJoined: "Déjà dans votre liste",
  join: "Rejoindre la sélection",
  joining: "Ajout…",
  nothingSelected: "Choisissez au moins un anniversaire.",
  rateLimited:
    "Google Agenda est occupé pour le moment — certaines invitations peuvent être retardées.",
  result: (joined: number, alreadyJoined: number, failed: number) =>
    [
      joined > 0 && `${joined} rejoint${joined === 1 ? "" : "s"}`,
      alreadyJoined > 0 && `${alreadyJoined} déjà dans votre liste`,
      failed > 0 && `${failed} échec${failed === 1 ? "" : "s"}`,
    ]
      .filter(Boolean)
      .join(" · ") || "Rien à faire.",
  error: (message: string) => `Une erreur est survenue : ${message}`,
} as const satisfies ShareLinkViewTexts;
