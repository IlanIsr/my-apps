import type { StatsTexts } from "@/app/components/StatsStrip";
import type { CollectionTexts } from "@/app/components/CollectionTab";

import { s } from "./plural";

export const stats = {
  ofCards: (total: number) => `/ ${total} cartes`,
  duplicates: (n: number) => `${n} doublon${s(n)}`,
  pages: (done: number, total: number) => `${done}/${total} pages`,
} as const satisfies StatsTexts;

export const collection = {
  search: "Code ou nom…",
  allPages: "Toutes les pages",
  page: (n: number) => `Page ${n}`,
  all: "Tout",
  missingFor: (name: string) => `Manque à ${name}`,
  duplicatesOf: (name: string) => `Doublons de ${name}`,
  inReserve: "En réserve",
  pageComplete: (name: string) => `${name} — page complète`,
  pageIncomplete: (name: string) => `${name} — page incomplète`,
  addOne: (name: string) => `Ajouter un exemplaire pour ${name}`,
  removeOne: (name: string) => `Retirer un exemplaire pour ${name}`,
  noMatchTitle: "Aucune carte ne correspond",
  noMatchBody: "Essaie un autre filtre, ou ajoute une carte avec le bouton +.",
  noKidsTitle: "Aucun enfant pour l'instant.",
  noKidsBody: "Ajoute-les dans les Réglages (roue dentée en haut à droite).",
} as const satisfies CollectionTexts;
