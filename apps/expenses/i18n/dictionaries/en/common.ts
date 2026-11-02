import type { AppShellTexts } from "@/app/components/AppShell";
import type { ErrorTexts } from "@/app/components/common";
import type { StatsTexts } from "@/app/components/GroceryStats";
import type { StoresTexts } from "@/app/components/StoresView";

export const appShell = {
  brand: "Expenses",
  language: "Language",
  menu: "Menu",
  nav: {
    goals: "Goals",
    expenses: "Expenses",
    receipts: "Receipts",
    products: "Products",
    shopping: "Shopping list",
    stats: "Summary",
    categories: "Categories",
  },
} as const satisfies AppShellTexts;

export const errors = {
  "not-found": "Not found.",
  "barcode-taken": "This barcode is already used by another product.",
  "not-signed-in": "Please sign in first.",
  invalid: "Invalid data — check the fields.",
  "db-not-configured": "The database is not configured.",
  unknown: "Something went wrong. Try again.",
  "photo-unreadable":
    "Couldn't read the photo. Try a sharper one, or enter the receipt by hand.",
  "photo-ai-off": "Photo reading isn't enabled yet (Vercel AI Gateway).",
} as const satisfies ErrorTexts;

export const stores = {
  title: "Stores",
  emptyTitle: "No stores",
  emptyDescription: "A store is created when you enter a receipt.",
  receiptCount: "{n} receipt(s)",
  lastVisit: "last visit {date}",
  products: "Products",
  rename: "Rename",
  save: "Save",
  cancel: "Cancel",
} as const satisfies StoresTexts;

export const stats = {
  title: "Groceries",
  byMonth: "By month",
  byStore: "By store",
  topProducts: "What costs the most",
  priceRises: "Biggest price rises",
  noRises: "No price rise spotted.",
  receiptCount: "{n} receipt(s)",
  atStore: "at {store}",
  byAisle: "By shelf",
  noAisle: "No shelf",
} as const satisfies StatsTexts;
