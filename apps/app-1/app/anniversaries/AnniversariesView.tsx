"use client";

import { useTranslations } from "@/i18n";
import type { Anniversary } from "@/lib/anniversary";
import { AnniversaryList } from "../components/anniversary/AnniversaryList";
import { ConnectPrompt } from "../components/anniversary/ConnectPrompt";

export function AnniversariesView({
  connected,
  anniversaries,
}: {
  connected: boolean;
  anniversaries: Anniversary[];
}) {
  const messages = useTranslations();

  if (!connected) {
    return <ConnectPrompt t={messages.connectPrompt} />;
  }
  return (
    <AnniversaryList anniversaries={anniversaries} t={messages.anniversaries} />
  );
}
