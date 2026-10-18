"use server";

/**
 * Server action behind the `/admin` "Copy from production" button. Re-checks
 * that the caller is an anniversaries admin, then runs {@link syncFromProd}
 * (which itself only works where `PROD_DATABASE_URL` is set, i.e. pre-prod).
 */

import { revalidatePath } from "next/cache";

import { getCurrentUserEmail } from "@repo/auth/user";
import { isAnniversariesAdmin, syncFromProd } from "@repo/anniversaries";

export type SyncResult =
  { ok: true; written: number; deleted: number } | { ok: false; error: string };

/** Replace this environment's anniversaries with a copy of production's. */
export async function syncFromProdAction(): Promise<SyncResult> {
  const email = await getCurrentUserEmail();
  if (!email || !isAnniversariesAdmin(email)) {
    return { ok: false, error: "forbidden" };
  }

  try {
    const result = await syncFromProd();
    revalidatePath("/anniversaries");
    revalidatePath("/calendar");
    revalidatePath("/admin");
    return { ok: true, ...result };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "unknown",
    };
  }
}
