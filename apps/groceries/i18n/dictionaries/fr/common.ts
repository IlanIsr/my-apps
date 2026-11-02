import type { AppShellTexts } from "@/app/components/AppShell";
import type { ErrorTexts } from "@/app/components/common";
import type { StatsTexts } from "@/app/components/StatsView";
import type { StoresTexts } from "@/app/components/StoresView";

export const appShell = {
  brand: "Courses",
  nav: {
    receipts: "Tickets",
    products: "Produits",
    stores: "Magasins",
    shopping: "Liste de courses",
    stats: "Dépenses",
  },
} as const satisfies AppShellTexts;

export const errors = {
  "not-found": "Introuvable.",
  "barcode-taken": "Ce code-barres est déjà utilisé par un autre produit.",
  "not-signed-in": "Connecte-toi d'abord.",
  invalid: "Données invalides — vérifie les champs.",
  "db-not-configured": "La base de données n'est pas configurée.",
  unknown: "Une erreur est survenue. Réessaie.",
} as const satisfies ErrorTexts;

export const stores = {
  title: "Magasins",
  emptyTitle: "Aucun magasin",
  emptyDescription: "Un magasin est créé quand tu saisis un ticket.",
  receiptCount: "{n} ticket(s)",
  lastVisit: "dernier passage {date}",
  products: "Produits",
  rename: "Renommer",
  save: "Enregistrer",
  cancel: "Annuler",
} as const satisfies StoresTexts;

export const stats = {
  title: "Dépenses",
  emptyTitle: "Rien à analyser",
  emptyDescription: "Saisis tes tickets pour voir où part ton argent.",
  byMonth: "Par mois",
  byStore: "Par magasin",
  topProducts: "Ce qui coûte le plus",
  priceRises: "Plus fortes hausses",
  noRises: "Aucune hausse de prix repérée.",
  receiptCount: "{n} ticket(s)",
  atStore: "chez {store}",
} as const satisfies StatsTexts;
