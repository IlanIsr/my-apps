import "server-only";

import { redirect } from "next/navigation";

import { getCurrentUserId } from "@repo/auth/user";

/** The signed-in Clerk user id (owner of every row), or `null`. */
export async function currentOwnerId(): Promise<string | null> {
  return getCurrentUserId();
}

/** The signed-in Clerk user id, or a redirect to `/sign-in`. */
export async function requireOwner(): Promise<string> {
  const userId = await currentOwnerId();
  if (!userId) redirect("/sign-in");
  return userId;
}
