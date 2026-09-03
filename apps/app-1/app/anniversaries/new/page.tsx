"use client";

import Link from "next/link";

import { useTranslations } from "@/i18n";
import { AnniversaryForm } from "../../components/anniversary/AnniversaryForm";
import { NewAnniversaryHeader } from "../../components/anniversary/NewAnniversaryHeader";

export default function NewAnniversaryPage() {
  const messages = useTranslations();

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/anniversaries"
        className="text-sm opacity-70 hover:opacity-100"
      >
        ←
      </Link>
      <NewAnniversaryHeader t={messages.newAnniversaryHeader} />
      <AnniversaryForm t={messages.anniversaryForm} />
    </div>
  );
}
