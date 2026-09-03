"use client";

import { useTranslations } from "@/i18n";
import { BackLink } from "../../components/BackLink";
import { AnniversaryForm } from "../../components/anniversary/AnniversaryForm";
import { NewAnniversaryHeader } from "../../components/anniversary/NewAnniversaryHeader";

export default function NewAnniversaryPage() {
  const messages = useTranslations();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <BackLink href="/anniversaries" />
        <NewAnniversaryHeader t={messages.newAnniversaryHeader} />
      </div>
      <AnniversaryForm t={messages.anniversaryForm} />
    </div>
  );
}
