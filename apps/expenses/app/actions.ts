"use server";

/**
 * Server actions. Each one resolves the signed-in Clerk user, validates its
 * input (`lib/validate.ts`), calls the store — which scopes every query to
 * that user — and maps failures to a stable error code.
 */

import { revalidatePath } from "next/cache";

import { DatabaseNotConfiguredError } from "@/db/client";
import type { Category, Goal, Transaction } from "@/lib/expense-logic";
import * as expenses from "@/lib/expense-store";
import { LIMITS, type Product, type Receipt } from "@/lib/grocery-logic";
import {
  readReceiptPhoto,
  ReaderError,
  type ReceiptDraft,
} from "@/lib/receipt-reader";
import { currentOwnerId } from "@/lib/owner";
import * as store from "@/lib/store";
import * as v from "@/lib/validate";

export type ActionErrorCode =
  | store.StoreErrorCode
  | "photo-unreadable"
  | "photo-ai-off"
  | "photo-busy"
  | "not-signed-in"
  | "invalid"
  | "db-not-configured"
  | "unknown";

export type ActionResult<T> =
  { ok: true; data: T } | { ok: false; error: ActionErrorCode };

class NotSignedInError extends Error {}

async function run<T>(
  fn: (ownerId: string) => Promise<T>,
  { readOnly = false } = {},
): Promise<ActionResult<T>> {
  try {
    const ownerId = await currentOwnerId();
    if (!ownerId) throw new NotSignedInError();
    const data = await fn(ownerId);
    // Every page reads fresh data server-side.
    if (!readOnly) revalidatePath("/", "layout");
    return { ok: true, data };
  } catch (error) {
    if (error instanceof NotSignedInError) {
      return { ok: false, error: "not-signed-in" };
    }
    if (error instanceof store.StoreError) {
      return { ok: false, error: error.code };
    }
    if (error instanceof ReaderError) {
      return { ok: false, error: error.code };
    }
    if (error instanceof v.InvalidInputError) {
      return { ok: false, error: "invalid" };
    }
    if (error instanceof DatabaseNotConfiguredError) {
      return { ok: false, error: "db-not-configured" };
    }
    console.error("[expenses] action failed:", error);
    return { ok: false, error: "unknown" };
  }
}

/** `id = null` creates. Returns the receipt id. */
export async function saveReceiptAction(
  id: string | null,
  input: unknown,
): Promise<ActionResult<string>> {
  return run((ownerId) =>
    store.saveReceipt(
      ownerId,
      id === null ? null : v.id(id),
      v.receiptInput(input),
    ),
  );
}

export async function deleteReceiptAction(
  id: string,
): Promise<ActionResult<null>> {
  return run(async (ownerId) => {
    await store.deleteReceipt(ownerId, v.id(id));
    return null;
  });
}

export async function updateProductAction(
  id: string,
  input: unknown,
): Promise<ActionResult<Product>> {
  return run((ownerId) =>
    store.updateProduct(ownerId, v.id(id), v.productInput(input)),
  );
}

export async function renameStoreAction(
  id: string,
  name: unknown,
): Promise<ActionResult<null>> {
  return run(async (ownerId) => {
    await store.renameStore(
      ownerId,
      v.id(id),
      v.text(name, "name", LIMITS.storeName),
    );
    return null;
  });
}

/** `quantityMilli = 0` removes it from the list. */
export async function setShoppingItemAction(
  productId: string,
  quantityMilli: number,
): Promise<ActionResult<null>> {
  return run(async (ownerId) => {
    await store.setShoppingItem(
      ownerId,
      v.id(productId),
      v.int(quantityMilli, "quantity", 0, LIMITS.quantityMilli),
    );
    return null;
  });
}

export async function clearShoppingAction(): Promise<ActionResult<null>> {
  return run(async (ownerId) => {
    await store.clearShopping(ownerId);
    return null;
  });
}

// ---------------------------------------------------------------------------
// Expenses

export async function createTransactionAction(
  input: unknown,
): Promise<ActionResult<Transaction>> {
  return run((ownerId) =>
    expenses.createTransaction(ownerId, v.transactionInput(input)),
  );
}

export async function updateTransactionAction(
  id: string,
  input: unknown,
): Promise<ActionResult<Transaction>> {
  return run((ownerId) =>
    expenses.updateTransaction(ownerId, v.id(id), v.transactionInput(input)),
  );
}

export async function deleteTransactionAction(
  id: string,
): Promise<ActionResult<null>> {
  return run(async (ownerId) => {
    await expenses.deleteTransaction(ownerId, v.id(id));
    return null;
  });
}

/** One expense's cash put back to the account on `on` (`null` = not yet). */
export async function setRepaidAction(
  id: string,
  on: string | null,
): Promise<ActionResult<Transaction>> {
  return run((ownerId) =>
    expenses.setRepaid(ownerId, v.id(id), on === null ? null : v.day(on)),
  );
}

/** "I put it all back" on `on`: every expense still owing cash. */
export async function settleRepaymentsAction(
  on: string,
): Promise<ActionResult<number>> {
  return run((ownerId) => expenses.settleRepayments(ownerId, v.day(on)));
}

export async function createCategoryAction(
  input: unknown,
): Promise<ActionResult<Category>> {
  return run((ownerId) =>
    expenses.createCategory(ownerId, v.categoryInput(input)),
  );
}

export async function updateCategoryAction(
  id: string,
  input: unknown,
): Promise<ActionResult<Category>> {
  return run((ownerId) =>
    expenses.updateCategory(ownerId, v.id(id), v.categoryInput(input)),
  );
}

/** Returns how many lines were added (already-imported ones are skipped). */
export async function importTransactionsAction(
  rows: unknown,
): Promise<ActionResult<number>> {
  return run((ownerId) =>
    expenses.importTransactions(ownerId, v.importRows(rows)),
  );
}

/** Reads a receipt photo (nothing saved — it pre-fills the form). */
export async function readReceiptPhotoAction(
  photo: unknown,
): Promise<ActionResult<ReceiptDraft>> {
  return run((ownerId) => readReceiptPhoto(ownerId, v.photo(photo)));
}

/** "These two are different products." */
export async function markDistinctAction(
  a: string,
  b: string,
): Promise<ActionResult<null>> {
  return run(async (ownerId) => {
    await store.markDistinct(ownerId, v.id(a), v.id(b));
    return null;
  });
}

/** Merges `drop` into `keep` (name / barcode chosen in `input`). */
export async function mergeProductsAction(
  keep: string,
  drop: string,
  input: unknown,
): Promise<ActionResult<null>> {
  return run(async (ownerId) => {
    await store.mergeProducts(
      ownerId,
      v.id(keep),
      v.id(drop),
      v.mergeInput(input),
    );
    return null;
  });
}

/** One receipt with its lines (shown inside its expense). */
export async function getReceiptAction(
  id: string,
): Promise<ActionResult<Receipt>> {
  return run(
    async (ownerId) => {
      const receipt = await store.getReceipt(ownerId, v.id(id));
      if (!receipt) throw new store.StoreError("not-found");
      return receipt;
    },
    { readOnly: true },
  );
}

export async function createGoalAction(
  input: unknown,
): Promise<ActionResult<Goal>> {
  return run((ownerId) => expenses.createGoal(ownerId, v.goalInput(input)));
}

export async function updateGoalAction(
  id: string,
  input: unknown,
): Promise<ActionResult<Goal>> {
  return run((ownerId) =>
    expenses.updateGoal(ownerId, v.id(id), v.goalInput(input)),
  );
}

export async function deleteGoalAction(
  id: string,
): Promise<ActionResult<null>> {
  return run(async (ownerId) => {
    await expenses.deleteGoal(ownerId, v.id(id));
    return null;
  });
}

/** Last month's goals, again for `to`. */
export async function copyGoalsAction(
  from: string,
  to: string,
): Promise<ActionResult<number>> {
  return run((ownerId) =>
    expenses.copyGoals(ownerId, v.month(from), v.month(to)),
  );
}
