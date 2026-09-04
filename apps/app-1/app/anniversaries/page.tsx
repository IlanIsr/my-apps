import { getCurrentUserEmail } from "@repo/auth/user";

import {
  isCalendarConfigured,
  listAnniversaries,
  type Anniversary,
} from "@repo/anniversaries";
import { AnniversariesView } from "./AnniversariesView";

export const dynamic = "force-dynamic";

async function load(): Promise<{ ready: boolean; anniversaries: Anniversary[] }> {
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
