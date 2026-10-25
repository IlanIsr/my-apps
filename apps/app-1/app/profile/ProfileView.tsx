"use client";

/**
 * The `/profile` page: one card per preference. Today only the minhag —
 * Ashkenazi switches the wording to "Yortzeit" and makes Adar I the default
 * for a new single-Adar anniversary (Sephardi: "Azkara", Adar II) — and the
 * Hebcal CSV import ({@link CsvImport}).
 */

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { Minhag } from "@repo/hebcal";
import { useLanguage } from "@/i18n";
import { Segmented } from "../components/Segmented";
import { saveMinhagAction } from "./actions";
import { CsvImport, type CsvImportTexts } from "./CsvImport";

/** Text for {@link ProfileView}. */
export type ProfileTexts = {
  title: string;
  intro: string;
  minhag: {
    title: string;
    sephardi: string;
    ashkenazi: string;
    /** What the choice changes. */
    hint: string;
  };
  saved: string;
  error: string;
  csvImport: CsvImportTexts;
};

export function ProfileView({ t }: { t: ProfileTexts }) {
  const { minhag: saved } = useLanguage();
  const router = useRouter();
  const [minhag, setMinhag] = useState<Minhag>(saved ?? "sephardi");
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<"saved" | "error" | null>(null);

  const change = async (next: Minhag) => {
    const previous = minhag;
    setMinhag(next);
    setStatus(null);
    setPending(true);
    const result = await saveMinhagAction(next);
    setPending(false);
    if (!result.ok) {
      setMinhag(previous);
      setStatus("error");
      return;
    }
    setStatus("saved");
    router.refresh();
  };

  const label =
    "font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-subtle-foreground";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-3xl font-semibold">{t.title}</h1>
        <p className="text-sm text-muted-foreground">{t.intro}</p>
      </div>

      <section className="flex flex-col gap-3 rounded-card border border-border bg-card p-5">
        <span className={label}>{t.minhag.title}</span>
        <div className={pending ? "pointer-events-none opacity-60" : ""}>
          <Segmented
            aria-label={t.minhag.title}
            value={minhag}
            onChange={change}
            options={[
              { value: "sephardi", label: t.minhag.sephardi },
              { value: "ashkenazi", label: t.minhag.ashkenazi },
            ]}
          />
        </div>
        <p className="text-xs text-muted-foreground">{t.minhag.hint}</p>
        {status === "saved" && <p className="text-xs">{t.saved}</p>}
        {status === "error" && (
          <p className="text-xs text-destructive">{t.error}</p>
        )}
      </section>

      <CsvImport t={t.csvImport} />
    </div>
  );
}
