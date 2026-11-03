import type { Messages } from "../../messages";
import {
  bilan,
  categories,
  categoryNames,
  goalCard,
  goalModal,
  goals,
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
  productModal,
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
  productModal,
  shoppingToggle,
  stores,
  shopping,
  stats,
  aisles,
  duplicates,
  scanner,
  goals,
  goalCard,
  goalModal,
} as const satisfies Messages;
