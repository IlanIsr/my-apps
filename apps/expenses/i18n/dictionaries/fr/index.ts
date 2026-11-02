import type { Messages } from "../../messages";
import {
  bilan,
  categories,
  categoryNames,
  importTexts,
  methods,
  transactionModal,
  transactions,
} from "./expenses";
import { appShell, errors, stats, stores } from "./common";
import {
  aisles,
  duplicates,
  product,
  products,
  shopping,
  shoppingToggle,
} from "./products";
import { receipt, receiptForm, receipts, scanner } from "./receipts";

/** The assembled message tree for this locale. */
export const fr = {
  appShell,
  errors,
  methods,
  categoryNames,
  transactions,
  transactionModal,
  categories,
  bilan,
  import: importTexts,
  receipts,
  receipt,
  receiptForm,
  products,
  product,
  shoppingToggle,
  stores,
  shopping,
  stats,
  aisles,
  duplicates,
  scanner,
} as const satisfies Messages;
