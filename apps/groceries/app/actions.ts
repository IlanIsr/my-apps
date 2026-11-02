"use server";

/**
 * Server actions. Each one resolves the signed-in Clerk user, validates its
 * input (`lib/validate.ts`), calls the store — which scopes every query to
 * that user — and maps failures to a stable error code.
 */

import { revalidatePath } from "next/cache";

import { DatabaseNotConfiguredError } from "@/db/client";
import { LIMITS, type Product } from "@/lib/grocery-logic";
import { currentOwnerId } from "@/lib/owner";
import * as store from "@/lib/store";
import * as v from "@/lib/validate";

export type ActionErrorCode =
  | store.StoreErrorCode
  | "not-signed-in"
  | "invalid"
  | "db-not-configured"
  | "unknown";

export type ActionResult<T> =
  { ok: true; data: T } | { ok: false; error: ActionErrorCode };

class NotSignedInError extends Error {}

async function run<T>(
  fn: (ownerId: string) => Promise<T>,
): Promise<ActionResult<T>> {
  try {
    const ownerId = await currentOwnerId();
    if (!ownerId) throw new NotSignedInError();
    const data = await fn(ownerId);
    // Every page reads fresh data server-side.
    revalidatePath("/", "layout");
    return { ok: true, data };
  } catch (error) {
    if (error instanceof NotSignedInError) {
      return { ok: false, error: "not-signed-in" };
    }
    if (error instanceof store.StoreError) {
      return { ok: false, error: error.code };
    }
    if (error instanceof v.InvalidInputError) {
      return { ok: false, error: "invalid" };
    }
    if (error instanceof DatabaseNotConfiguredError) {
      return { ok: false, error: "db-not-configured" };
    }
    console.error("[groceries] action failed:", error);
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
