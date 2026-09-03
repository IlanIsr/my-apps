import { isGoogleCalendarConnected, listAnniversaries } from "@/server/calendar";
import type { AgendaItem } from "../components/anniversary/CalendarAgenda";
import { AgendaView } from "./AgendaView";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const connected = await isGoogleCalendarConnected();
  if (!connected) {
    return <AgendaView connected={false} items={[]} />;
  }

  const today = new Date().toISOString().slice(0, 10);
  const items: AgendaItem[] = (await listAnniversaries())
    .flatMap((anniversary) =>
      anniversary.events.map((event) => ({
        anniversaryId: anniversary.id,
        name: anniversary.name,
        date: event.date,
        time: event.time,
        htmlLink: event.htmlLink,
      })),
    )
    .filter((item) => item.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));

  return <AgendaView connected items={items} />;
}
