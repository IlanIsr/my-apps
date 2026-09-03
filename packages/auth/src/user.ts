import { auth, clerkClient } from "@clerk/nextjs/server";

/**
 * The signed-in user's primary email address, or `null` if not signed in.
 * Server-only. Used to invite the user to shared calendar events.
 */
export async function getCurrentUserEmail(): Promise<string | null> {
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
}
