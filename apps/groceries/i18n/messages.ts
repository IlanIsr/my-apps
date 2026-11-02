/**
 * Assembles the app-wide {@link Messages} type from every component's own
 * `XxxTexts`. Add a UI string by extending the owning component's type, then
 * adding it to that feature's file in every `dictionaries/<locale>/`.
 */

import type { AppShellTexts } from "@/app/components/AppShell";
import type { ErrorTexts } from "@/app/components/common";
import type { ProductsTexts } from "@/app/components/ProductsView";
import type { ProductTexts } from "@/app/components/ProductView";
import type { ReceiptFormTexts } from "@/app/components/ReceiptFormView";
import type { ReceiptsTexts } from "@/app/components/ReceiptsView";
import type { ReceiptTexts } from "@/app/components/ReceiptView";
import type { ShoppingToggleTexts } from "@/app/components/ShoppingToggle";
import type { ShoppingTexts } from "@/app/components/ShoppingView";
import type { StatsTexts } from "@/app/components/StatsView";
import type { StoresTexts } from "@/app/components/StoresView";

/** The message tree. Every dictionary must `satisfies Messages`. */
export type Messages = {
  appShell: AppShellTexts;
  errors: ErrorTexts;
  receipts: ReceiptsTexts;
  receipt: ReceiptTexts;
  receiptForm: ReceiptFormTexts;
  products: ProductsTexts;
  product: ProductTexts;
  shoppingToggle: ShoppingToggleTexts;
  stores: StoresTexts;
  shopping: ShoppingTexts;
  stats: StatsTexts;
};
