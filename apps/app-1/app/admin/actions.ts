"use server";

/**
 * Server action behind the `/admin` "Copy from production" button. Re-checks
 * that the caller is an anniversaries admin, then runs {@link syncFromProd}
 * (which itself only works where `PROD_DATABASE_URL` is set, i.e. pre-prod).
 */

import { revalidatePath } from "next/cache";

import { getCurrentUserEmail } from "@repo/auth/user";
import {
  CalendarRateLimitError,
  isAnniversariesAdmin,
  listPersonIds,
  resyncPerson,
  syncFromProd,
} from "@repo/anniversaries";

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

async function isAdmin(): Promise<boolean> {
  const email = await getCurrentUserEmail();
  return !!email && isAnniversariesAdmin(email);
}

/** Every person id, for the "update every event" button to walk. */
export async function listPersonIdsAction(): Promise<
  { ok: true; ids: string[] } | { ok: false; error: string }
> {
  if (!(await isAdmin())) return { ok: false, error: "forbidden" };
  try {
    return { ok: true, ids: await listPersonIds() };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "unknown",
    };
  }
}

/**
 * Rewrite one person's calendar series as events are built today (tzeit on
 * the eve → shkia the next day). Silent: no emails. One call per person so the
 * client can show progress and resume after a rate limit.
 */
export async function resyncPersonAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await isAdmin())) return { ok: false, error: "forbidden" };
  try {
    await resyncPerson(id);
    return { ok: true };
  } catch (error) {
    if (error instanceof CalendarRateLimitError) {
      return { ok: false, error: "rate-limited" };
    }
    console.error(`[admin] resync of ${id} failed:`, error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "unknown",
    };
  }
}
