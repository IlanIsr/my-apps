"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { useTranslations } from "@/i18n";
import { Button } from "../components/Button";
import { Eyebrow } from "../components/Eyebrow";
import { Ornament } from "../components/Ornament";
import { syncFromProdAction } from "./actions";

export type AdminTexts = {
  eyebrow: string;
  title: string;
  subtitle: string;
  empty: string;
  sync: {
    title: string;
    body: string;
    button: string;
    running: string;
    confirm: string;
    done: (written: number, deleted: number) => string;
    error: (message: string) => string;
  };
};

export function AdminView({ canSync }: { canSync: boolean }) {
  const t = useTranslations().admin;
  const router = useRouter();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const runSync = () => {
    if (!confirm(t.sync.confirm)) return;
    setMessage(null);
    setFailed(false);
    start(async () => {
      const result = await syncFromProdAction();
      if (result.ok) {
        setMessage(t.sync.done(result.written, result.deleted));
        router.refresh();
      } else {
        setFailed(true);
        setMessage(t.sync.error(result.error));
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Eyebrow>{t.eyebrow}</Eyebrow>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
          {t.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.subtitle}</p>
      </div>

      {canSync ? (
        <section className="flex flex-col gap-3 rounded-card border border-border bg-card p-5">
          <div>
            <h2 className="font-display text-lg font-semibold">
              {t.sync.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{t.sync.body}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={runSync}
            className="self-start"
          >
            {pending ? t.sync.running : t.sync.button}
          </Button>
          {message && (
            <p
              className={`text-sm ${failed ? "text-destructive" : "text-muted-foreground"}`}
            >
              {message}
            </p>
          )}
        </section>
      ) : (
        <div className="flex flex-col items-center gap-2.5 rounded-card border border-dashed border-border-strong bg-card/50 px-6 py-10 text-center">
          <Ornament className="mb-1" />
          <p className="max-w-xs text-sm text-muted-foreground">{t.empty}</p>
        </div>
      )}
    </div>
  );
}
