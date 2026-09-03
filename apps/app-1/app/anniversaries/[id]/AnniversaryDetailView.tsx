"use client";

import { useTranslations } from "@/i18n";
import type { Anniversary } from "@/lib/anniversary";
import { AnniversaryDetail } from "../../components/anniversary/AnniversaryDetail";
import { CalendarUnavailable } from "../../components/anniversary/CalendarUnavailable";

export function AnniversaryDetailView({
  configured,
  anniversary,
}: {
  configured: boolean;
  anniversary: Anniversary | null;
}) {
  const messages = useTranslations();

  if (!configured) {
    return <CalendarUnavailable t={messages.calendarUnavailable} />;
  }
  if (!anniversary) return null;

  return (
    <AnniversaryDetail anniversary={anniversary} t={messages.anniversaryDetail} />
  );
}
