import type { SetupTexts } from "@/app/components/SetupView";

export const setup = {
  eyebrow: "Nouveau classeur",
  title: "Classeur Panini",
  intro:
    "Suis la collection de cartes de tes enfants : qui a quoi, les doublons à échanger, les pages complètes et les prix à gagner.",
  name: "Nom de la collection",
  defaultName: "Ma collection",
  total: "Nombre de cartes de départ",
  totalHint:
    "Génère des cartes numérotées de 1 à N. Tu pourras importer la vraie liste (codes avec lettres compris) depuis les Réglages.",
  perPage: "Cartes par page",
  kids: "Prénoms des enfants",
  kidsPlaceholder: "ex. Léa, Tom",
  kidsHint: "Séparés par des virgules. Modifiable ensuite dans les Réglages.",
  reserveName: "Réserve",
  create: "Créer le classeur",
} as const satisfies SetupTexts;
