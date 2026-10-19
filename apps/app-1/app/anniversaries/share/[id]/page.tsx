/**
 * `/anniversaries/share/[id]` route (server). Checks the store + calendar
 * are configured, loads the share-link preview, and hands off to
 * {@link ShareLinkView}. Unlike `[id]/page.tsx`, a *missing* link (bad/
 * unknown id) is `notFound()` — but an *expired* one still renders; the view
 * is what decides how to show that state.
 */

import { notFound } from "next/navigation";

import { getCurrentUserEmail } from "@repo/auth/user";

import {
  getShareLinkPreview,
  isCalendarConfigured,
  type ShareLinkPreviewItem,
} from "@repo/anniversaries";
import { ShareLinkView } from "./ShareLinkView";

export const dynamic = "force-dynamic";
// Joining re-syncs the calendar sequentially per selected anniversary (same
// reasoning as `[id]/page.tsx`) — a link covering several can take a while.
export const maxDuration = 60;

type Preview = { expired: boolean; items: ShareLinkPreviewItem[] };

async function load(
  id: string,
): Promise<{ ready: boolean; preview: Preview | null }> {
  try {
    const [configured, email] = await Promise.all([
      isCalendarConfigured(),
      getCurrentUserEmail(),
    ]);
    if (!configured || !email) return { ready: false, preview: null };
    return { ready: true, preview: await getShareLinkPreview(id, email) };
  } catch (error) {
    console.error("[anniversaries] share-link failed:", error);
    return { ready: false, preview: null };
  }
}

export default async function ShareLinkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { ready, preview } = await load(id);

  if (!ready) {
    return <ShareLinkView configured={false} id={id} preview={null} />;
  }
  if (!preview) notFound();

  return <ShareLinkView configured id={id} preview={preview} />;
}
