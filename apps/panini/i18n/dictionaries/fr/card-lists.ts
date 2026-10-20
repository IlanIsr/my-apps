import type { CardListsTexts } from "@/app/components/CardLists";
import type { PagesTexts } from "@/app/components/PagesTab";

import { s } from "./plural";

export const cardLists = {
  gives: (from: string, to: string) => `${from} donne à ${to}`,
  nothingToTrade: "Rien à échanger pour l'instant.",
  noKidsPairs: "Ajoute au moins deux enfants pour voir les échanges.",
  page: (n: number) => `page ${n}`,
  inReserve: (n: number) => `${n} en réserve`,
  reserveEmptyTitle: "Rien en réserve",
  reserveEmptyBody:
    "Monte le compteur « Réserve » sur une carte pour voir ici à qui la donner.",
  toGive: (n: number) => `${n} carte${s(n)} à lui donner`,
  nothingForKid: (name: string) =>
    `Rien en réserve qui manque à ${name} pour l'instant.`,
  leftover: "Reste en réserve",
  leftoverHint: "Tout le monde l'a déjà — à garder pour un futur échange.",
  cardsCount: (n: number) => `${n} carte${s(n)}`,
} as const satisfies CardListsTexts;

export const pages = {
  empty: "Aucune page",
  cardsCount: (n: number) => `${n} carte${s(n)}`,
  progress: (name: string, owned: number, total: number) =>
    `${name} : ${owned}/${total}`,
} as const satisfies PagesTexts;
