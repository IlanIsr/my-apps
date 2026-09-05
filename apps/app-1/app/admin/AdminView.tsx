"use client";

import { useTranslations } from "@/i18n";
import { Eyebrow } from "../components/Eyebrow";
import { Ornament } from "../components/Ornament";

export type AdminTexts = {
  eyebrow: string;
  title: string;
  subtitle: string;
  empty: string;
};

export function AdminView() {
  const t = useTranslations().admin;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Eyebrow>{t.eyebrow}</Eyebrow>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
          {t.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.subtitle}</p>
      </div>

      <div className="flex flex-col items-center gap-2.5 rounded-card border border-dashed border-border-strong bg-card/50 px-6 py-10 text-center">
        <Ornament className="mb-1" />
        <p className="max-w-xs text-sm text-muted-foreground">{t.empty}</p>
      </div>
    </div>
  );
}
