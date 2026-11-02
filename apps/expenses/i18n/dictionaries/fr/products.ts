import type { ProductsTexts } from "@/app/components/ProductsView";
import type { ProductTexts } from "@/app/components/ProductView";
import type { ShoppingToggleTexts } from "@/app/components/ShoppingToggle";
import type { ShoppingTexts } from "@/app/components/ShoppingView";

export const products = {
  stores: "Magasins",
  title: "Produits",
  search: "Nom ou code-barres",
  allStores: "Tous les magasins",
  store: "Magasin",
  emptyTitle: "Aucun produit",
  emptyDescription: "Les produits sont créés à partir de tes tickets.",
  noMatch: "Aucun produit ne correspond.",
  cheapestAt: "le moins cher chez {store}",
  lastBought: "acheté le {date}",
  perKg: "/kg",
  count: "{n} produit(s)",
} as const satisfies ProductsTexts;

export const product = {
  back: "Produits",
  compare: "Prix par magasin",
  store: "Magasin",
  lastPrice: "Dernier prix",
  date: "Date",
  cheapest: "Le moins cher",
  moreExpensive: "+{pct}%",
  history: "Historique",
  noPrice: "Pas encore de prix.",
  perKg: "/kg",
  details: "Détails",
  edit: "Modifier",
  name: "Nom",
  barcode: "Code-barres",
  unit: { unit: "À la pièce", kg: "Au kg" },
  save: "Enregistrer",
  cancel: "Annuler",
  range: "Payé entre {min} et {max}",
} as const satisfies ProductTexts;

export const shoppingToggle = {
  add: "Liste",
  added: "Dans la liste",
} as const satisfies ShoppingToggleTexts;

export const shopping = {
  title: "Liste de courses",
  add: "Ajouter un produit",
  addPlaceholder: "Ajouter un produit…",
  clear: "Vider la liste",
  emptyTitle: "Liste vide",
  emptyDescription:
    "Ajoute des produits déjà achetés : l'app te dit dans quel magasin la liste revient le moins cher.",
  quantity: "Quantité",
  kg: "kg",
  remove: "Retirer",
  whereTitle: "Où acheter ?",
  best: "Le moins cher",
  missing: "{n} produit(s) sans prix ici",
  complete: "Tous les produits ont un prix",
  noStores: "Aucun magasin pour l'instant.",
  splitTitle: "En répartissant entre magasins",
  splitSaves: "Chaque produit au magasin le moins cher : {amount} d'économie.",
  splitNoGain: "Aucune économie à répartir : un seul magasin suffit.",
  unpriced: "Sans prix connu : {names}",
} as const satisfies ShoppingTexts;
