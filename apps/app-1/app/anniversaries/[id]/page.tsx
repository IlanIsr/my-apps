import { notFound } from "next/navigation";

import { AnniversaryDetail } from "../../components/anniversary/AnniversaryDetail";
import { ConnectPrompt } from "../../components/anniversary/ConnectPrompt";
import { getAnniversary, isGoogleCalendarConnected } from "@/server/calendar";

export const dynamic = "force-dynamic";

export default async function AnniversaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isGoogleCalendarConnected())) {
    return <ConnectPrompt />;
  }

  const { id } = await params;
  const anniversary = await getAnniversary(id);
  if (!anniversary) notFound();

  return <AnniversaryDetail anniversary={anniversary} />;
}
