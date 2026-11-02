import type { Messages } from "../../messages";
import { appShell, errors, stats, stores } from "./common";
import { product, products, shopping, shoppingToggle } from "./products";
import { receipt, receiptForm, receipts } from "./receipts";

/** The assembled message tree for this locale. */
export const fr = {
  appShell,
  errors,
  receipts,
  receipt,
  receiptForm,
  products,
  product,
  shoppingToggle,
  stores,
  shopping,
  stats,
} as const satisfies Messages;
