import { getCurrentUserEmail } from "@repo/auth/user";

import { isCalendarConfigured, listAnniversaries } from "@repo/anniversaries";
import type { AgendaItem } from "../components/anniversary/CalendarAgenda";
import { AgendaView } from "./AgendaView";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const [configured, email] = await Promise.all([
    isCalendarConfigured(),
    getCurrentUserEmail(),
  ]);
  if (!configured || !email) {
    return <AgendaView configured={false} items={[]} />;
  }

  const today = new Date().toISOString().slice(0, 10);
  const items: AgendaItem[] = (await listAnniversaries(email))
    .flatMap((anniversary) =>
      anniversary.events.map((event) => ({
        anniversaryId: anniversary.id,
        name: anniversary.name,
        type: anniversary.type,
        year: event.year,
        hebYear: anniversary.hebYear,
        date: event.date,
        time: event.time,
        htmlLink: event.htmlLink,
      })),
    )
    .filter((item) => item.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));

  return <AgendaView configured items={items} />;
}
