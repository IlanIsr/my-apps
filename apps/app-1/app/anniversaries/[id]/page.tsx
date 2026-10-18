import { notFound } from "next/navigation";

import { getCurrentUserEmail } from "@repo/auth/user";

import {
  getAnniversary,
  isCalendarConfigured,
  type Anniversary,
} from "@repo/anniversaries";
import { AnniversaryDetailView } from "./AnniversaryDetailView";

export const dynamic = "force-dynamic";
// Edit/leave actions here re-sync every stored calendar event sequentially
// (~150ms apart, to avoid rate-limiting the shared calendar) — a person with
// many years of events can take well past the default function timeout.
export const maxDuration = 60;

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
