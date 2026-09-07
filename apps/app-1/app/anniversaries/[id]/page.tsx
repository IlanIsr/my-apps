/**
 * `/anniversaries/[id]` route (server). Checks the store + calendar are
 * configured, loads the person by id (not filtered by membership — a shared
 * link still opens), and hands off to {@link AnniversaryDetailView}. A
 * misconfigured backend degrades to the "unavailable" screen rather than a 500.
 */

import { notFound } from "next/navigation";

import { getCurrentUserEmail } from "@repo/auth/user";

import {
  getAnniversary,
  isCalendarConfigured,
  type Anniversary,
} from "@repo/anniversaries";
import { AnniversaryDetailView } from "./AnniversaryDetailView";

export const dynamic = "force-dynamic";

async function load(
  id: string,
): Promise<{ ready: boolean; anniversary: Anniversary | null }> {
  try {
    const [configured, email] = await Promise.all([
      isCalendarConfigured(),
      getCurrentUserEmail(),
    ]);
    if (!configured || !email) return { ready: false, anniversary: null };
    return { ready: true, anniversary: await getAnniversary(id, email) };
  } catch (error) {
    console.error("[anniversaries] detail failed:", error);
    return { ready: false, anniversary: null };
  }
}

export default async function AnniversaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { ready, anniversary } = await load(id);

  if (!ready) {
    return <AnniversaryDetailView configured={false} anniversary={null} />;
  }
  if (!anniversary) notFound();

  return <AnniversaryDetailView configured anniversary={anniversary} />;
}
