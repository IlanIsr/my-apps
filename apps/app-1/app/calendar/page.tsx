import { getCurrentUserEmail } from "@repo/auth/user";

import { isCalendarConfigured, listAnniversaries } from "@repo/anniversaries";
import type { AgendaItem } from "../components/anniversary/CalendarAgenda";
import { AgendaView } from "./AgendaView";

export const dynamic = "force-dynamic";

async function load(): Promise<{ ready: boolean; items: AgendaItem[] }> {
  try {
    const [configured, email] = await Promise.all([
      isCalendarConfigured(),
      getCurrentUserEmail(),
    ]);
    if (!configured || !email) return { ready: false, items: [] };

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

    return { ready: true, items };
  } catch (error) {
    console.error("[anniversaries] agenda failed:", error);
    return { ready: false, items: [] };
  }
}

export default async function CalendarPage() {
  const { ready, items } = await load();
  return <AgendaView configured={ready} items={items} />;
}
