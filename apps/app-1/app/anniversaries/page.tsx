import { AnniversaryList } from "../components/anniversary/AnniversaryList";
import { ConnectPrompt } from "../components/anniversary/ConnectPrompt";
import { isGoogleCalendarConnected, listAnniversaries } from "@/server/calendar";

export const dynamic = "force-dynamic";

export default async function AnniversariesPage() {
  if (!(await isGoogleCalendarConnected())) {
    return <ConnectPrompt />;
  }

  const anniversaries = await listAnniversaries();
  return <AnniversaryList anniversaries={anniversaries} />;
}
