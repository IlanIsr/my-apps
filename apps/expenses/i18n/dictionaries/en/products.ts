import type { AisleTexts } from "@/app/components/ProductView";
import type { DuplicatesTexts } from "@/app/components/DuplicatesView";
import type { ProductModalTexts } from "@/app/components/ProductModal";
import type { ProductsTexts } from "@/app/components/ProductsView";
import type { ProductTexts } from "@/app/components/ProductView";
import type { ShoppingToggleTexts } from "@/app/components/ShoppingToggle";
import type { ShoppingTexts } from "@/app/components/ShoppingView";

export const products = {
  stores: "Stores",
  title: "Products",
  search: "Name or barcode",
  allStores: "All stores",
  store: "Store",
  emptyTitle: "No products",
  emptyDescription: "Products are created from your receipts.",
  noMatch: "No product matches.",
  cheapestAt: "cheapest at {store}",
  lastBought: "bought on {date}",
  perKg: "/kg",
  count: "{n} product(s)",
  aisle: "Shelf",
  allAisles: "All shelves",
  sort: "Sort",
  sortName: "By name",
  sortMeasure: "Price per L / kg",
  duplicates: "🔁 Duplicates ({n})",
} as const satisfies ProductsTexts;

export const product = {
  back: "Products",
  compare: "Price by store",
  store: "Store",
  lastPrice: "Last price",
  date: "Date",
  cheapest: "Cheapest",
  moreExpensive: "+{pct}%",
  history: "History",
  noPrice: "No price yet.",
  perKg: "/kg",
  details: "Details",
  edit: "Edit",
  name: "Name",
  barcode: "Barcode",
  unit: { unit: "By the piece", kg: "Per kg" },
  save: "Save",
  cancel: "Cancel",
  range: "Paid between {min} and {max}",
  aisle: "Shelf",
  noAisle: "—",
  content: "Content of one piece",
  contentHint: "E.g. 1.5 L or 0.5 kg — to compare per litre / kilo.",
  contentUnits: { l: "L", kg: "kg" },
  badContent: "Invalid content.",
} as const satisfies ProductTexts;

export const productModal = {
  add: "Add a product",
  title: "New product",
  friendHint: "Many products with their prices?",
  friendReceipt: "A friend's receipt",
  create: "Create",
  cancel: "Cancel",
} as const satisfies ProductModalTexts;

export const shoppingToggle = {
  add: "List",
  added: "On the list",
} as const satisfies ShoppingToggleTexts;

export const shopping = {
  title: "Shopping list",
  add: "Add a product",
  addPlaceholder: "Add a product…",
  clear: "Clear the list",
  emptyTitle: "Empty list",
  emptyDescription:
    "Add products you've bought before: the app tells you which store makes the list cheapest.",
  quantity: "Quantity",
  kg: "kg",
  remove: "Remove",
  whereTitle: "Where to buy?",
  best: "Cheapest",
  missing: "{n} product(s) with no price here",
  complete: "Every product has a price",
  noStores: "No stores yet.",
  splitTitle: "Splitting between stores",
  splitSaves: "Each product at its cheapest store: {amount} saved.",
  splitNoGain: "Nothing to gain by splitting: one store is enough.",
  unpriced: "No known price: {names}",
} as const satisfies ShoppingTexts;

export const aisles = {
  produce: "Fruit & veg",
  dairy: "Dairy",
  meat: "Meat",
  fish: "Fish",
  bakery: "Bakery",
  pantry: "Pantry",
  frozen: "Frozen",
  snacks: "Snacks & sweets",
  drinks: "Drinks",
  hygiene: "Hygiene",
  cleaning: "Cleaning",
  household: "Household",
  other: "Other",
} as const satisfies AisleTexts;

export const duplicates = {
  back: "Products",
  title: "Duplicates",
  description:
    "These products have alike names: are they the same product? Nothing is merged without your say.",
  emptyTitle: "No duplicates",
  emptyDescription: "No suspicious pair of products for now.",
  purchases: "{n} purchase(s)",
  lastPrice: "last price {price}",
  noBarcode: "no barcode",
  keepName: "Keep",
  keepBarcode: "Barcode to keep",
  same: "Yes, same product",
  different: "No, different",
} as const satisfies DuplicatesTexts;
