import { notFound } from "next/navigation";

import { getAnniversary, isGoogleCalendarConnected } from "@/server/calendar";
import { AnniversaryDetailView } from "./AnniversaryDetailView";

export const dynamic = "force-dynamic";

export default async function AnniversaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const connected = await isGoogleCalendarConnected();
  if (!connected) {
    return <AnniversaryDetailView connected={false} anniversary={null} />;
  }

  const { id } = await params;
  const anniversary = await getAnniversary(id);
  if (!anniversary) notFound();

  return <AnniversaryDetailView connected anniversary={anniversary} />;
}
