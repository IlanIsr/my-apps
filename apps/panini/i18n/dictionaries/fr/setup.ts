import type { SetupTexts } from "@/app/components/SetupView";

export const setup = {
  eyebrow: "Nouveau classeur",
  title: "Classeur Panini",
  intro:
    "Suis la collection de cartes de tes enfants : qui a quoi, les doublons à échanger, les pages complètes et les prix à gagner.",
  name: "Nom de la collection",
  defaultName: "Ma collection",
  kids: "Prénoms des enfants",
  kidsPlaceholder: "ex. Léa, Tom",
  kidsHint: "Séparés par des virgules. Modifiable ensuite dans les Réglages.",
  reserveName: "Réserve",
  create: "Créer le classeur",
} as const satisfies SetupTexts;
