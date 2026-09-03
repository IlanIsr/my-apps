import { auth, clerkClient } from "@clerk/nextjs/server";

/**
 * The Google OAuth access token for the signed-in user, with whatever scopes are
 * configured on Clerk's Google connection (e.g. `calendar.events`). Clerk keeps
 * it fresh. Returns `null` if there's no session or the user hasn't granted
 * Google access.
 *
 * Server-only.
 */
export async function getGoogleAccessToken(): Promise<string | null> {
  const { userId } = await auth();
  if (!userId) return null;

  try {
    const client = await clerkClient();
    const { data } = await client.users.getUserOauthAccessToken(userId, "google");
    return data[0]?.token ?? null;
  } catch {
    return null;
  }
}
