/**
 * `/anniversaries` route (server) — the app's landing page (`/` redirects
 * here). Checks the store + calendar, lists the anniversaries the viewer is on
 * (admins see all), and renders {@link AnniversariesView}. A backend error
 * degrades to the "unavailable" screen rather than a 500.
 */

import { getCurrentUserEmail } from "@repo/auth/user";

import {
  isCalendarConfigured,
  listAnniversaries,
  type Anniversary,
} from "@repo/anniversaries";
import { AnniversariesView } from "./AnniversariesView";

export const dynamic = "force-dynamic";
// Bulk "share my list" fans out one calendar sync per anniversary.
export const maxDuration = 60;

async function load(): Promise<{
  ready: boolean;
  anniversaries: Anniversary[];
}> {
  try {
    const [configured, email] = await Promise.all([
      isCalendarConfigured(),
      getCurrentUserEmail(),
    ]);
    if (!configured || !email) return { ready: false, anniversaries: [] };
    return { ready: true, anniversaries: await listAnniversaries(email) };
  } catch (error) {
    // A misconfigured / unreachable backend shouldn't 500 the route — fall back
    // to the "unavailable" screen. The cause is in the server logs.
    console.error("[anniversaries] list failed:", error);
    return { ready: false, anniversaries: [] };
  }
}

export default async function AnniversariesPage() {
  const { ready, anniversaries } = await load();
  return <AnniversariesView configured={ready} anniversaries={anniversaries} />;
}
