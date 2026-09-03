import {
  CalendarAgenda,
  type AgendaItem,
} from "../components/anniversary/CalendarAgenda";
import { ConnectPrompt } from "../components/anniversary/ConnectPrompt";
import { isGoogleCalendarConnected, listAnniversaries } from "@/server/calendar";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  if (!(await isGoogleCalendarConnected())) {
    return <ConnectPrompt />;
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

  return <CalendarAgenda items={items} />;
}
