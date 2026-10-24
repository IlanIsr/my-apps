/**
 * `/about` route — the same "what is this" page signed-out visitors get at `/`,
 * reachable from the navbar once signed in too. Public, like `/`.
 */

import { getCurrentUserId } from "@repo/auth/user";

import { LandingView } from "../LandingView";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const userId = await getCurrentUserId();
  return <LandingView signedIn={Boolean(userId)} />;
}
