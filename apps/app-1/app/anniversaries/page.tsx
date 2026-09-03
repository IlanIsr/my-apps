import { isGoogleCalendarConnected, listAnniversaries } from "@/server/calendar";
import { AnniversariesView } from "./AnniversariesView";

export const dynamic = "force-dynamic";

export default async function AnniversariesPage() {
  const connected = await isGoogleCalendarConnected();
  const anniversaries = connected ? await listAnniversaries() : [];

  return (
    <AnniversariesView connected={connected} anniversaries={anniversaries} />
  );
}
