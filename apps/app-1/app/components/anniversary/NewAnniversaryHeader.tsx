"use client";

import { useI18n } from "@/i18n/context";

export function NewAnniversaryHeader() {
  const { t } = useI18n();
  return (
    <div>
      <h1 className="text-2xl font-bold">{t.anniversary.new.title}</h1>
      <p className="mt-1 text-sm opacity-70">{t.anniversary.new.subtitle}</p>
    </div>
  );
}
