"use server";

/**
 * `/profile` — saves the signed-in user's preferences on their `users` row.
 * Only their own row: the email comes from the session, never from the client.
 */

import { revalidatePath } from "next/cache";

import { setUserMinhag, toMinhag } from "@repo/anniversaries";
import { getCurrentUserEmail, getCurrentUserId } from "@repo/auth/user";
import type { Minhag } from "@repo/hebcal";

export type ProfileResult =
  { ok: true } | { ok: false; error: "not-signed-in" | "failed" };

export async function saveMinhagAction(minhag: Minhag): Promise<ProfileResult> {
  const [email, userId] = await Promise.all([
    getCurrentUserEmail(),
    getCurrentUserId(),
  ]);
  if (!email || !userId) return { ok: false, error: "not-signed-in" };
  try {
    await setUserMinhag({ email, clerkId: userId, minhag: toMinhag(minhag) });
  } catch (error) {
    console.error("[profile] saving minhag failed:", error);
    return { ok: false, error: "failed" };
  }
  // The root layout reads the minhag — re-render every page with it.
  revalidatePath("/", "layout");
  return { ok: true };
}
