"use client";

/**
 * `/anniversaries/new` — a client route (it needs the message dictionary for
 * the form). Just composes {@link NewAnniversaryHeader} + {@link AnniversaryForm}.
 */

import { useTranslations } from "@/i18n";
import { AnniversaryForm } from "../../components/anniversary/AnniversaryForm";
import { NewAnniversaryHeader } from "../../components/anniversary/NewAnniversaryHeader";

export default function NewAnniversaryPage() {
  const messages = useTranslations();

  return (
    <div className="flex flex-col gap-6">
      <NewAnniversaryHeader t={messages.newAnniversaryHeader} />
      <AnniversaryForm t={messages.anniversaryForm} />
    </div>
  );
}
