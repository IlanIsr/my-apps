"use client";

import { useTranslations } from "@/i18n";

export type NewAnniversaryHeaderTexts = {
  title: string;
  subtitle: string;
};

export function NewAnniversaryHeader() {
  const t = useTranslations().newAnniversaryHeader;
  return (
    <div>
      <h1 className="text-2xl font-bold">{t.title}</h1>
      <p className="mt-1 text-sm opacity-70">{t.subtitle}</p>
    </div>
  );
}
