import { cache } from "react";

import { auth, clerkClient } from "@clerk/nextjs/server";

/**
 * The signed-in user's Clerk id, or `null` if not signed in. Server-only.
 * Used to record who created a record.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId ?? null;
}

/**
 * The signed-in user's primary email address, or `null` if not signed in.
 * Server-only. Used to invite the user to shared calendar events. Cached per
 * request — the layout and the page both call it.
 */
export const getCurrentUserEmail = cache(
  async (): Promise<string | null> => {
    const { userId } = await auth();
    if (!userId) return null;

    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      return (
        user.primaryEmailAddress?.emailAddress ??
        user.emailAddresses[0]?.emailAddress ??
        null
      );
    } catch {
      return null;
    }
  },
);
