"use client";

import { useTranslations } from "@/i18n";
import type { Anniversary } from "@/lib/anniversary";
import { AnniversaryDetail } from "../../components/anniversary/AnniversaryDetail";
import { ConnectPrompt } from "../../components/anniversary/ConnectPrompt";

export function AnniversaryDetailView({
  connected,
  anniversary,
}: {
  connected: boolean;
  anniversary: Anniversary | null;
}) {
  const messages = useTranslations();

  if (!connected) {
    return <ConnectPrompt t={messages.connectPrompt} />;
  }
  if (!anniversary) return null;

  return (
    <AnniversaryDetail anniversary={anniversary} t={messages.anniversaryDetail} />
  );
}
