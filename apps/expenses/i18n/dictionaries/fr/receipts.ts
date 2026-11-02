import type { ReceiptFormTexts } from "@/app/components/ReceiptFormView";
import type { ReceiptsTexts } from "@/app/components/ReceiptsView";
import type { ReceiptTexts } from "@/app/components/ReceiptView";

export const receipts = {
  title: "Mes tickets",
  add: "Nouveau ticket",
  allStores: "Tous les magasins",
  store: "Magasin",
  emptyTitle: "Aucun ticket",
  emptyDescription:
    "Saisis ton premier ticket de caisse : l'app calcule la somme pour la vérifier et garde les prix.",
  lineCount: "{n} article(s)",
  matches: "OK",
  mismatch: "Écart",
} as const satisfies ReceiptsTexts;

export const receipt = {
  back: "Tickets",
  edit: "Modifier",
  delete: "Supprimer",
  deleteTitle: "Supprimer ce ticket ?",
  deleteDescription: "Ses prix ne compteront plus dans les comparaisons.",
  cancel: "Annuler",
  sum: "Somme calculée",
  printed: "Total du ticket",
  difference: "Écart {diff}",
  discount: "remise",
  matches: "Correspond",
  mismatch: "Ne correspond pas",
} as const satisfies ReceiptTexts;

export const receiptForm = {
  newTitle: "Nouveau ticket",
  editTitle: "Modifier le ticket",
  store: "Magasin",
  storePlaceholder: "Ex. Shufersal",
  date: "Date",
  declaredTotal: "Total imprimé",
  note: "Note",
  lines: "Articles",
  barcode: "Code-barres",
  label: "Nom",
  unit: { unit: "Pièce", kg: "Au kg" },
  quantity: "Quantité",
  weight: "Poids (kg)",
  unitPrice: "Prix unitaire",
  pricePerKg: "Prix / kg",
  discount: "Remise",
  lineTotal: "Total",
  removeLine: "Retirer la ligne",
  addLine: "Ajouter une ligne",
  sum: "Somme",
  printed: "Total du ticket",
  matches: "Correspond",
  mismatch: "Écart {diff}",
  noDeclared: "Saisis le total pour vérifier",
  method: "Payé en",
  save: "Enregistrer",
  cancel: "Annuler",
  needStore: "Indique le magasin.",
  badLine: "Ligne {n} : nom, quantité ou prix invalide.",
} as const satisfies ReceiptFormTexts;
