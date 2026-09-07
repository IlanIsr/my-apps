"use client";

/**
 * Client boundary for `/calendar`: renders {@link CalendarAgenda} with the
 * server-fetched, date-sorted items, or {@link CalendarUnavailable} when the
 * feature isn't configured.
 */

import { useTranslations } from "@/i18n";
import {
  CalendarAgenda,
  type AgendaItem,
} from "../components/anniversary/CalendarAgenda";
import { CalendarUnavailable } from "../components/anniversary/CalendarUnavailable";

export function AgendaView({
  configured,
  items,
}: {
  configured: boolean;
  items: AgendaItem[];
}) {
  const messages = useTranslations();

  if (!configured) {
    return <CalendarUnavailable t={messages.calendarUnavailable} />;
  }
  return <CalendarAgenda items={items} t={messages.agenda} />;
}
