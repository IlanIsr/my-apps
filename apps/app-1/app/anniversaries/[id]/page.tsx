import { notFound } from "next/navigation";

import { getCurrentUserEmail } from "@repo/auth/user";

import { getAnniversary, isCalendarConfigured } from "@/server/calendar";
import { AnniversaryDetailView } from "./AnniversaryDetailView";

export const dynamic = "force-dynamic";

export default async function AnniversaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [configured, email] = await Promise.all([
    isCalendarConfigured(),
    getCurrentUserEmail(),
  ]);
  if (!configured || !email) {
    return <AnniversaryDetailView configured={false} anniversary={null} />;
  }

  const { id } = await params;
  const anniversary = await getAnniversary(id, email);
  if (!anniversary) notFound();

  return <AnniversaryDetailView configured anniversary={anniversary} />;
}
