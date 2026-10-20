import type { RewardModalTexts } from "@/app/components/RewardModal";
import type { RewardsTexts } from "@/app/components/RewardsTab";

import { s } from "./plural";

export const rewards = {
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
  complete: "Complète",
  reserveCompletes: "Complétable avec la réserve",
  missing: (n: number, codes: string) => `Manque ${n} : ${codes}`,
  edit: "Modifier",
} as const satisfies RewardsTexts;

export const rewardModal = {
  title: (page: number) => `Prix de la page ${page}`,
  newTitle: "Nouveau prix",
  page: "Page",
  prize: "Prix à gagner",
  prizePlaceholder: "ex. Ballon officiel",
  kind: "Comment le gagner",
  kindDeadline: "Avant une date",
  kindFirstN: "Les premiers",
  deadline: "Date limite",
  winners: "Nombre de gagnants",
  winnersHint: "Les X premiers à compléter la page gagnent.",
  save: "Enregistrer",
  cancel: "Annuler",
  remove: "Supprimer",
} as const satisfies RewardModalTexts;
