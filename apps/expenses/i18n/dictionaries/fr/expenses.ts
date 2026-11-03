import type { GoalCardTexts } from "@/app/components/GoalCard";
import type { GoalModalTexts } from "@/app/components/GoalModal";
import type { GoalsTexts } from "@/app/components/GoalsView";
import type { BilanTexts } from "@/app/components/BilanView";
import type { CategoriesTexts } from "@/app/components/CategoriesView";
import type { ImportTexts } from "@/app/components/ImportView";
import type {
  CategoryNameTexts,
  MethodTexts,
  TransactionModalTexts,
} from "@/app/components/TransactionModal";
import type { TransactionsTexts } from "@/app/components/TransactionsView";

export const methods = {
  cash: "Espèces",
  card: "Carte",
  cibus: "Cibus",
} as const satisfies MethodTexts;

export const categoryNames = {
  groceries: "Supermarché",
  restaurant: "Restaurant",
  transport: "Transport",
  housing: "Logement",
  health: "Santé",
  clothing: "Vêtements",
  leisure: "Loisirs",
  subscriptions: "Abonnements",
  other: "Divers",
} as const satisfies CategoryNameTexts;

export const transactions = {
  title: "Dépenses",
  add: "Ajouter une dépense",
  previous: "Mois précédent",
  next: "Mois suivant",
  total: "Total du mois",
  allCategories: "Toutes les catégories",
  allMethods: "Tous les paiements",
  uncategorized: "Sans catégorie",
  emptyTitle: "Aucune dépense",
  emptyDescription:
    "Touche « + » à chaque paiement : montant, catégorie, c'est noté. Pour les courses, saisis le ticket détaillé.",
  noMatch: "Aucune dépense ce mois-ci avec ces filtres.",
  receipt: "Ticket de courses",
  importStatement: "Importer un relevé",
  budgetNear:
    "{category} : {spent} sur {budget} — le budget est presque atteint.",
  budgetOver: "{category} : {spent} sur {budget} — budget dépassé.",
  projection: "≈ {amount} en fin de mois à ce rythme",
  perLiter: "{liters} L × {price}/L",
  goals: "Objectifs du mois",
  seeGoals: "Voir",
} as const satisfies TransactionsTexts;

export const transactionModal = {
  addTitle: "Nouvelle dépense",
  editTitle: "Modifier la dépense",
  amount: "Montant",
  category: "Catégorie",
  merchant: "Où",
  merchantPlaceholder: "Ex. Boulangerie",
  method: "Payé en",
  date: "Date",
  note: "Note",
  save: "Enregistrer",
  cancel: "Annuler",
  delete: "Supprimer",
  badAmount: "Indique un montant.",
  fromReceipt: "Cette dépense est le total d'un ticket de courses.",
  openReceipt: "Voir le ticket",
  byAmount: "Montant",
  byLiter: "Au litre",
  liters: "Litres",
  pricePerLiter: "Prix au litre",
  bySplit: "Détail",
  itemLabel: "Article",
  itemAmount: "Montant de la ligne",
  addItem: "Ajouter une ligne",
  removeItem: "Retirer la ligne",
  badItems: "Chaque ligne a besoin d'un nom et d'un montant.",
} as const satisfies TransactionModalTexts;

export const categories = {
  title: "Catégories",
  description:
    "Renomme, change l'icône, fixe un budget mensuel (alerte à 80 % et au dépassement) ou masque une catégorie.",
  icon: "Icône",
  name: "Nom",
  budget: "Budget / mois",
  noBudget: "Aucun",
  hidden: "Masquée",
  save: "Enregistrer",
  add: "Ajouter",
  newName: "Nouvelle catégorie",
} as const satisfies CategoriesTexts;

export const bilan = {
  title: "Bilan",
  emptyTitle: "Rien à analyser",
  emptyDescription: "Ajoute tes dépenses pour voir où part ton argent.",
  previous: "Mois précédent",
  next: "Mois suivant",
  total: "Total",
  vsPrevious: "{amount} par rapport au mois précédent",
  byCategory: "Par catégorie",
  ofBudget: "/ {budget}",
  uncategorized: "Sans catégorie",
  methods: "Moyens de paiement",
  last12: "12 derniers mois",
  editBudgets: "Budgets",
} as const satisfies BilanTexts;

export const importTexts = {
  title: "Importer un relevé",
  description:
    "Exporte le relevé de ta carte en CSV ou Excel depuis le site de la banque, puis choisis le fichier. Rien n'est envoyé avant que tu valides ; les lignes déjà importées ou déjà saisies sont décochées.",
  pickFile: "Choisir un fichier",
  unreadable: "Fichier illisible. Essaie l'export CSV ou Excel (.xlsx).",
  columns: "Colonnes",
  date: "Date",
  merchant: "Commerçant",
  amount: "Montant",
  none: "—",
  summary: "{n} lignes lues ({skipped} ignorées).",
  alreadyImported: "déjà importée",
  matches: "déjà saisie ? ({what})",
  uncategorized: "Sans catégorie",
  importButton: "Importer {n} ligne(s)",
  done: "{n} dépense(s) importée(s).",
} as const satisfies ImportTexts;

export const goals = {
  title: "Objectifs",
  description:
    "Fixe ce que tu veux dépenser au maximum ce mois-ci : au total, par catégorie ou par moyen de paiement.",
  previous: "Mois précédent",
  next: "Mois suivant",
  add: "Ajouter un objectif",
  emptyTitle: "Aucun objectif ce mois-ci",
  emptyDescription:
    "Ajoute un objectif, par exemple « 3 000 ₪ au total » ou « 400 ₪ de restaurants ».",
  copy: "Reprendre les {n} objectif(s) de {month}",
} as const satisfies GoalsTexts;

export const goalCard = {
  total: "Toutes les dépenses",
  spentOf: "{spent} dépensés sur {amount}",
  remaining: "Reste {amount}",
  over: "Dépassé de {amount}",
  perDay: "soit {amount} par jour ({days} j restants)",
  projection: "≈ {amount} en fin de mois à ce rythme",
  projectionOver:
    "⚠ À ce rythme : {amount} en fin de mois, au-dessus de l'objectif",
} as const satisfies GoalCardTexts;

export const goalModal = {
  addTitle: "Nouvel objectif",
  editTitle: "Modifier l'objectif",
  scope: "Sur",
  scopes: { total: "Tout", category: "Une catégorie", method: "Un paiement" },
  category: "Catégorie",
  method: "Moyen de paiement",
  amount: "Maximum à dépenser",
  name: "Nom (optionnel)",
  namePlaceholder: "Ex. Mois raisonnable",
  save: "Enregistrer",
  cancel: "Annuler",
  delete: "Supprimer",
  badAmount: "Montant invalide.",
} as const satisfies GoalModalTexts;
