/**
 * Assembles the app-wide {@link Messages} type from every component's own
 * `XxxTexts`. Add a UI string by extending the owning component's type, then
 * adding it to that feature's file in every `dictionaries/<locale>/`.
 */

import type { AppShellTexts } from "@/app/components/AppShell";
import type { BilanTexts } from "@/app/components/BilanView";
import type { GoalCardTexts } from "@/app/components/GoalCard";
import type { GoalModalTexts } from "@/app/components/GoalModal";
import type { GoalsTexts } from "@/app/components/GoalsView";
import type { CategoriesTexts } from "@/app/components/CategoriesView";
import type { ImportTexts } from "@/app/components/ImportView";
import type {
  CategoryNameTexts,
  MethodTexts,
  TransactionModalTexts,
} from "@/app/components/TransactionModal";
import type { TransactionsTexts } from "@/app/components/TransactionsView";
import type { ErrorTexts } from "@/app/components/common";
import type { ProductsTexts } from "@/app/components/ProductsView";
import type { AisleTexts, ProductTexts } from "@/app/components/ProductView";
import type { DuplicatesTexts } from "@/app/components/DuplicatesView";
import type { ScannerTexts } from "@/app/components/BarcodeScanner";
import type { ReceiptFormTexts } from "@/app/components/ReceiptFormView";
import type { ReceiptsTexts } from "@/app/components/ReceiptsView";
import type { ReceiptTexts } from "@/app/components/ReceiptView";
import type { ShoppingToggleTexts } from "@/app/components/ShoppingToggle";
import type { ShoppingTexts } from "@/app/components/ShoppingView";
import type { StatsTexts } from "@/app/components/GroceryStats";
import type { StoresTexts } from "@/app/components/StoresView";

/** The message tree. Every dictionary must `satisfies Messages`. */
export type Messages = {
  appShell: AppShellTexts;
  errors: ErrorTexts;
  methods: MethodTexts;
  categoryNames: CategoryNameTexts;
  transactions: TransactionsTexts;
  transactionModal: TransactionModalTexts;
  categories: CategoriesTexts;
  bilan: BilanTexts;
  import: ImportTexts;
  receipts: ReceiptsTexts;
  receipt: ReceiptTexts;
  receiptForm: ReceiptFormTexts;
  products: ProductsTexts;
  product: ProductTexts;
  shoppingToggle: ShoppingToggleTexts;
  stores: StoresTexts;
  shopping: ShoppingTexts;
  stats: StatsTexts;
  aisles: AisleTexts;
  duplicates: DuplicatesTexts;
  scanner: ScannerTexts;
  goals: GoalsTexts;
  goalCard: GoalCardTexts;
  goalModal: GoalModalTexts;
};
