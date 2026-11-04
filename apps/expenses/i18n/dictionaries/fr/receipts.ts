import type { ScannerTexts } from "@/app/components/BarcodeScanner";
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
  monthSpent: "Courses ce mois-ci",
  ofBudget: "/ {budget}",
  projection: "≈ {amount} en fin de mois à ce rythme",
  setBudget: "Fixer un budget",
  friend: "Ami",
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
  deposit: "consigne",
  matches: "Correspond",
  mismatch: "Ne correspond pas",
  subtotal: "Sous-total",
  rounding: "Arrondi (espèces)",
  friend: "Ticket d'un ami",
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
  deposit: "Consigne",
  lineTotal: "Total",
  removeLine: "Retirer la ligne",
  addLine: "Ajouter une ligne",
  sum: "Somme",
  printed: "Total du ticket",
  matches: "Correspond",
  mismatch: "Écart {diff}",
  noDeclared: "Saisis le total pour vérifier",
  method: "Payé en",
  category: "Catégorie",
  save: "Enregistrer",
  cancel: "Annuler",
  needStore: "Indique le magasin.",
  badLine: "Ligne {n} : nom, quantité ou prix invalide.",
  scan: "Scanner le code-barres",
  scanContinuous: "Scanner à la suite",
  photo: "Photo du ticket",
  reading: "Lecture…",
  photoRead:
    "{n} ligne(s) lue(s) sur la photo — vérifie chacune avant d'enregistrer.",
  gallery: "Galerie",
  rounding: "dont arrondi {amount}",
  combine: "Regrouper les lignes (doublons, consignes)",
  fromFriend: "Ticket d'un ami — pas ma dépense",
  fromFriendHint:
    "Ses produits et ses prix enrichissent la base, sans compter comme une dépense.",
  pasteText: "Coller le texte",
  pasteTitle: "Coller le texte du ticket",
  pasteHint:
    "Le ticket numérique copié tel quel (nom, code-barres + quantité, ₪ total). Magasin, date et total sont à remplir ensuite.",
  pasteFill: "Pré-remplir",
  pasteNothing: "Aucun article reconnu dans ce texte.",
  textRead:
    "{n} ligne(s) lue(s) du texte — vérifie chacune avant d'enregistrer.",
} as const satisfies ReceiptFormTexts;

export const scanner = {
  title: "Scanner un code-barres",
  continuousTitle: "Scanner à la suite",
  hint: "Vise le code-barres, il est lu tout seul.",
  noCamera:
    "Caméra indisponible — autorise l'accès à la caméra dans le navigateur.",
  scanned: "{n} code(s) scanné(s)",
  done: "Terminé",
  already: "{code} déjà dans le ticket — ajuste sa quantité",
} as const satisfies ScannerTexts;
