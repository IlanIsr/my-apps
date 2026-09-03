import { getCurrentUserEmail } from "@repo/auth/user";

import { isCalendarConfigured, listAnniversaries } from "@repo/anniversaries";
import { AnniversariesView } from "./AnniversariesView";

export const dynamic = "force-dynamic";

export default async function AnniversariesPage() {
  const [configured, email] = await Promise.all([
    isCalendarConfigured(),
    getCurrentUserEmail(),
  ]);
  const ready = configured && !!email;
  const anniversaries = ready ? await listAnniversaries(email) : [];

  return (
    <AnniversariesView configured={ready} anniversaries={anniversaries} />
  );
}
