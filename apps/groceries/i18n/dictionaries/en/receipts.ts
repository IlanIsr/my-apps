import type { ReceiptFormTexts } from "@/app/components/ReceiptFormView";
import type { ReceiptsTexts } from "@/app/components/ReceiptsView";
import type { ReceiptTexts } from "@/app/components/ReceiptView";

export const receipts = {
  title: "My receipts",
  add: "New receipt",
  allStores: "All stores",
  store: "Store",
  emptyTitle: "No receipts",
  emptyDescription:
    "Enter your first till receipt: the app adds it up so you can check it, and keeps the prices.",
  lineCount: "{n} item(s)",
  matches: "OK",
  mismatch: "Mismatch",
} as const satisfies ReceiptsTexts;

export const receipt = {
  back: "Receipts",
  edit: "Edit",
  delete: "Delete",
  deleteTitle: "Delete this receipt?",
  deleteDescription: "Its prices will no longer count in comparisons.",
  cancel: "Cancel",
  sum: "Computed sum",
  printed: "Receipt total",
  difference: "Difference {diff}",
  discount: "discount",
  matches: "Matches",
  mismatch: "Doesn't match",
} as const satisfies ReceiptTexts;

export const receiptForm = {
  newTitle: "New receipt",
  editTitle: "Edit receipt",
  store: "Store",
  storePlaceholder: "e.g. Shufersal",
  date: "Date",
  declaredTotal: "Printed total",
  note: "Note",
  lines: "Items",
  barcode: "Barcode",
  label: "Name",
  unit: { unit: "Piece", kg: "Per kg" },
  quantity: "Quantity",
  weight: "Weight (kg)",
  unitPrice: "Unit price",
  pricePerKg: "Price / kg",
  discount: "Discount",
  lineTotal: "Total",
  removeLine: "Remove line",
  addLine: "Add a line",
  sum: "Sum",
  printed: "Receipt total",
  matches: "Matches",
  mismatch: "Difference {diff}",
  noDeclared: "Enter the total to check",
  save: "Save",
  cancel: "Cancel",
  needStore: "Enter the store.",
  badLine: "Line {n}: invalid name, quantity or price.",
} as const satisfies ReceiptFormTexts;
