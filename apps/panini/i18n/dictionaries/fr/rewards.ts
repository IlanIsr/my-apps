import type { RewardModalTexts } from "@/app/components/RewardModal";
import type { RewardsTexts } from "@/app/components/RewardsTab";

import { s } from "./plural";

export const rewards = {
  add: "Ajouter un prix",
  hideExpired: "Masquer les terminés",
  sortBy: "Trier par",
  sortUrgency: "Par urgence",
  sortDate: "Par date",
  sortCompletion: "Par complétion",
  noMatch: "Tous les prix sont terminés.",
  emptyTitle: "Aucun prix pour l'instant",
  emptyBody:
    "Certaines pages font gagner un prix si on les complète avant une date, ou si on est parmi les premiers. Ajoute-les ici pour savoir lesquelles finir en priorité.",
  page: (n: number) => `Page ${n}`,
  before: (date: string) => `Avant le ${date}`,
  daysLeft: (days: number) =>
    days === 0 ? "dernier jour !" : `encore ${days} jour${s(days)}`,
  expired: "terminé",
  firstN: (n: number) => `Les ${n} premiers`,
  firstNHint: "à finir au plus vite",
  complete: "Complète",
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
