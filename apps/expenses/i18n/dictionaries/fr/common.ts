import type { AppShellTexts } from "@/app/components/AppShell";
import type { ErrorTexts } from "@/app/components/common";
import type { StatsTexts } from "@/app/components/GroceryStats";
import type { StoresTexts } from "@/app/components/StoresView";

export const appShell = {
  brand: "Expenses",
  language: "Langue",
  menu: "Menu",
  nav: {
    expenses: "Dépenses",
    receipts: "Tickets",
    products: "Produits",
    shopping: "Liste de courses",
    stats: "Bilan",
    categories: "Catégories",
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
  title: "Courses",
  byMonth: "Par mois",
  byStore: "Par magasin",
  topProducts: "Ce qui coûte le plus",
  priceRises: "Plus fortes hausses",
  noRises: "Aucune hausse de prix repérée.",
  receiptCount: "{n} ticket(s)",
  atStore: "chez {store}",
} as const satisfies StatsTexts;
