import type { RewardsTexts } from "@/app/components/RewardsTab";

import { s } from "./plural";

export const rewards = {
  search: "Chercher une page ou un prix",
  hideExpired: "Masquer les terminés",
  everyone: "Tout le monde",
  person: "Pour qui",
  sortBy: "Trier par",
  sortDate: "Par date",
  sortPage: "Par page",
  sortCompletion: "Par complétion",
  ascending: "Croissant",
  descending: "Décroissant",
  completion: (pct: number) => `${pct} % complété`,
  noMatch: "Tous les prix sont terminés.",
  emptyTitle: "Aucun prix pour l'instant",
  emptyBody: "Les prix de cet album ne sont pas encore renseignés.",
  page: (n: number) => `Page ${n}`,
  before: (date: string) => `Avant le ${date}`,
  daysLeft: (days: number) =>
    days === 0 ? "dernier jour !" : `encore ${days} jour${s(days)}`,
  expired: "terminé",
  firstN: (n: number) => `Les ${n} premiers`,
  firstNHint: "à finir au plus vite",
  tiersTitle: "Classement",
  tiersHint: "Plus tu finis tôt, plus le prix est gros",
  rank: (from: number, to: number) => {
    const ord = (n: number) => (n === 1 ? "1er" : `${n}e`);
    return from === to ? ord(from) : `${ord(from)}–${ord(to)}`;
  },
  complete: "Complète",
  reserveCompletes: "Complétable avec la réserve",
  missing: (n: number) => `Manque ${n}`,
  owned: "Possédée",
  inReserve: "Dans la réserve",
  together: "Tout en commun",
  togetherRow: "Ensemble (réserve comprise)",
  completeTogether: "Complète ensemble",
} as const satisfies RewardsTexts;
