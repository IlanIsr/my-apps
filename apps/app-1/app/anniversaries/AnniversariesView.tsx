"use client";

import { useTranslations } from "@/i18n";
import type { Anniversary } from "@repo/anniversaries";
import { AnniversaryList } from "../components/anniversary/AnniversaryList";
import { CalendarUnavailable } from "../components/anniversary/CalendarUnavailable";

export function AnniversariesView({
  configured,
  anniversaries,
}: {
  configured: boolean;
  anniversaries: Anniversary[];
}) {
  const messages = useTranslations();

  if (!configured) {
    return <CalendarUnavailable t={messages.calendarUnavailable} />;
  }
  return (
    <AnniversaryList anniversaries={anniversaries} t={messages.anniversaries} />
  );
}
