import type { SettingsTexts } from "@/app/components/SettingsModal";

const COLOR_NAMES: Record<string, string> = {
  rose: "rose",
  blue: "bleu",
  amber: "ambre",
  green: "vert",
  violet: "violet",
  teal: "turquoise",
};

export const settings = {
  title: "Réglages",
  albumName: "Nom de la collection",
  save: "Enregistrer",
  kidsTitle: "Enfants",
  kidsHint: "Chaque enfant a son compteur sur chaque carte.",
  kidName: "Prénom",
  addKid: "Ajouter",
  removeKid: "Retirer",
  confirmRemoveKid: (name: string) =>
    `Retirer ${name} supprime aussi tous ses comptages.`,
  colorLabel: (color: string) => `Couleur ${COLOR_NAMES[color] ?? color}`,
  resetHint: "Supprime tout le classeur.",
  reset: "Réinitialiser",
  resetTitle: "Réinitialiser le classeur",
  resetConfirm:
    "Toutes les cartes, tous les comptages, les enfants et les prix seront supprimés définitivement.",
  resetButton: "Tout supprimer",
  cancel: "Annuler",
} as const satisfies SettingsTexts;
