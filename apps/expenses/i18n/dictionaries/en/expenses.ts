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
  cash: "Cash",
  card: "Card",
  cibus: "Cibus",
} as const satisfies MethodTexts;

export const categoryNames = {
  groceries: "Groceries",
  restaurant: "Restaurants",
  transport: "Transport",
  housing: "Housing",
  health: "Health",
  clothing: "Clothing",
  leisure: "Leisure",
  subscriptions: "Subscriptions",
  other: "Other",
} as const satisfies CategoryNameTexts;

export const transactions = {
  title: "Expenses",
  add: "Add an expense",
  previous: "Previous month",
  next: "Next month",
  total: "Month total",
  allCategories: "All categories",
  allMethods: "All payments",
  uncategorized: "Uncategorized",
  emptyTitle: "No expenses",
  emptyDescription:
    "Tap “+” whenever you pay: amount, category, done. For groceries, enter the detailed receipt.",
  noMatch: "No expense this month with these filters.",
  receipt: "Grocery receipt",
  importStatement: "Import a statement",
  budgetNear: "{category}: {spent} of {budget} — almost at the budget.",
  budgetOver: "{category}: {spent} of {budget} — over budget.",
  projection: "≈ {amount} by month end at this pace",
  perLiter: "{liters} L × {price}/L",
  goals: "This month's goals",
  seeGoals: "See",
} as const satisfies TransactionsTexts;

export const transactionModal = {
  addTitle: "New expense",
  editTitle: "Edit expense",
  amount: "Amount",
  category: "Category",
  merchant: "Where",
  merchantPlaceholder: "e.g. Bakery",
  method: "Paid by",
  date: "Date",
  note: "Note",
  save: "Save",
  cancel: "Cancel",
  delete: "Delete",
  badAmount: "Enter an amount.",
  fromReceipt: "This expense is a grocery receipt's total.",
  openReceipt: "Open the receipt",
  byAmount: "Amount",
  byLiter: "By the litre",
  liters: "Litres",
  pricePerLiter: "Price per litre",
  bySplit: "Split",
  itemLabel: "Item",
  itemAmount: "Line amount",
  addItem: "Add a line",
  removeItem: "Remove the line",
  badItems: "Each line needs a name and an amount.",
} as const satisfies TransactionModalTexts;

export const categories = {
  title: "Categories",
  description:
    "Rename, change the icon, set a monthly budget (alert at 80% and when over) or hide a category.",
  icon: "Icon",
  name: "Name",
  budget: "Budget / month",
  noBudget: "None",
  hidden: "Hidden",
  save: "Save",
  add: "Add",
  newName: "New category",
} as const satisfies CategoriesTexts;

export const bilan = {
  title: "Summary",
  emptyTitle: "Nothing to analyse",
  emptyDescription: "Add your expenses to see where your money goes.",
  previous: "Previous month",
  next: "Next month",
  total: "Total",
  vsPrevious: "{amount} vs the previous month",
  byCategory: "By category",
  ofBudget: "/ {budget}",
  uncategorized: "Uncategorized",
  methods: "Payment methods",
  last12: "Last 12 months",
  editBudgets: "Budgets",
} as const satisfies BilanTexts;

export const importTexts = {
  title: "Import a statement",
  description:
    "Export your card statement as CSV or Excel from your bank's website, then pick the file. Nothing is sent until you confirm; lines already imported or already entered are unticked.",
  pickFile: "Choose a file",
  unreadable: "Can't read this file. Try the CSV or Excel (.xlsx) export.",
  columns: "Columns",
  date: "Date",
  merchant: "Merchant",
  amount: "Amount",
  none: "—",
  summary: "{n} lines read ({skipped} skipped).",
  alreadyImported: "already imported",
  matches: "already entered? ({what})",
  uncategorized: "Uncategorized",
  importButton: "Import {n} line(s)",
  done: "{n} expense(s) imported.",
} as const satisfies ImportTexts;

export const goals = {
  title: "Goals",
  description:
    "Set the most you want to spend this month: in total, per category or per payment method.",
  previous: "Previous month",
  next: "Next month",
  add: "Add a goal",
  emptyTitle: "No goal this month",
  emptyDescription:
    "Add a goal, e.g. “₪3,000 in total” or “₪400 on restaurants”.",
  copy: "Reuse {month}'s {n} goal(s)",
} as const satisfies GoalsTexts;

export const goalCard = {
  total: "All spending",
  spentOf: "{spent} spent of {amount}",
  remaining: "{amount} left",
  over: "{amount} over",
  perDay: "that's {amount} a day ({days} days left)",
  projection: "≈ {amount} by month end at this pace",
  projectionOver: "⚠ At this pace: {amount} by month end, above the goal",
} as const satisfies GoalCardTexts;

export const goalModal = {
  addTitle: "New goal",
  editTitle: "Edit goal",
  scope: "On",
  scopes: { total: "Everything", category: "A category", method: "A payment" },
  category: "Category",
  method: "Payment method",
  amount: "Most to spend",
  name: "Name (optional)",
  namePlaceholder: "E.g. Careful month",
  save: "Save",
  cancel: "Cancel",
  delete: "Delete",
  badAmount: "Invalid amount.",
} as const satisfies GoalModalTexts;
