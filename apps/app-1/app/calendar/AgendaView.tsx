"use client";

import { useTranslations } from "@/i18n";
import {
  CalendarAgenda,
  type AgendaItem,
} from "../components/anniversary/CalendarAgenda";
import { ConnectPrompt } from "../components/anniversary/ConnectPrompt";

export function AgendaView({
  connected,
  items,
}: {
  connected: boolean;
  items: AgendaItem[];
}) {
  const messages = useTranslations();

  if (!connected) {
    return <ConnectPrompt t={messages.connectPrompt} />;
  }
  return <CalendarAgenda items={items} t={messages.agenda} />;
}
