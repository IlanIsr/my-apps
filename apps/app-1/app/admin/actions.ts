"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUserEmail } from "@repo/auth/user";
import { isAnniversariesAdmin, syncFromProd } from "@repo/anniversaries";

export type SyncResult =
  | { ok: true; written: number; deleted: number }
  | { ok: false; error: string };

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
