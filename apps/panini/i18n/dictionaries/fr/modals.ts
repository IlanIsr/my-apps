import type { CardModalTexts } from "@/app/components/CardModal";
import type { SettingsTexts } from "@/app/components/SettingsModal";

import { s } from "./plural";

export const cardModal = {
  addTitle: "Ajouter une carte",
  editTitle: "Modifier la carte",
  card: "Carte",
  code: "Code de la carte",
  codePlaceholder: "ex. 12 ou 12A",
  page: "Page",
  label: "Nom (optionnel)",
  labelPlaceholder: "ex. Nom du joueur",
  add: "Ajouter",
  save: "Enregistrer",
  cancel: "Annuler",
  delete: "Supprimer",
  confirmDelete: (code: string) =>
    `Supprimer définitivement la carte ${code} ? Cette action est irréversible.`,
} as const satisfies CardModalTexts;

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
  perPage: "Cartes par page (pour les futurs ajouts)",
  save: "Enregistrer",
  kidsTitle: "Enfants",
  kidsHint: "Chaque enfant a son compteur sur chaque carte.",
  kidName: "Prénom",
  addKid: "Ajouter",
  removeKid: "Retirer",
  confirmRemoveKid: (name: string) =>
    `Retirer ${name} supprime aussi tous ses comptages.`,
  colorLabel: (color: string) => `Couleur ${COLOR_NAMES[color] ?? color}`,
  importLabel: "Importer une liste de cartes",
  importPlaceholder:
    "Page 1\n1, Nom du joueur\n2\n12A, Variante dorée\n\nPage 2\n13\nSP1, Carte spéciale",
  importHint:
    "Une carte par ligne : code, puis page et nom optionnels (séparés par une virgule). Une ligne « Page N » règle la page des lignes suivantes. Un code déjà présent est mis à jour plutôt que dupliqué.",
  importButton: "Importer",
  importEmpty: "Rien à importer — vérifie le format.",
  importDone: (added: number, updated: number) =>
    `${added} carte${s(added)} ajoutée${s(added)}, ${updated} mise${s(updated)} à jour.`,
  bulkLabel: "Ajouter des cartes numérotées à la suite",
  bulkPlaceholder: "ex. 24",
  bulkButton: "Ajouter ces cartes",
  resetHint: "Supprime tout le classeur.",
  reset: "Réinitialiser",
  resetTitle: "Réinitialiser le classeur",
  resetConfirm:
    "Toutes les cartes, tous les comptages, les enfants et les prix seront supprimés définitivement.",
  resetButton: "Tout supprimer",
  cancel: "Annuler",
} as const satisfies SettingsTexts;
