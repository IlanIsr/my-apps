"use client";

/**
 * `/` — the user's documents, most recently worked on first: progress
 * (read / translated / proofread), target language, date. Also the entry
 * points: a new document, or the built-in example. Route boundary: reads its
 * texts.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createDocumentAction } from "@/app/actions";
import { useLanguage, useTranslations, LOCALE_TAG } from "@/i18n";
import { buildExample } from "@/lib/example";
import type { DocumentSummary } from "@/lib/model";
import { putScan } from "@/lib/scan-store";

import { Button } from "./Button";
import {
  EmptyState,
  ErrorLine,
  fill,
  formatDate,
  LinkButton,
  PageHeader,
} from "./common";

export type DocumentsTexts = {
  eyebrow: string;
  title: string;
  newDocument: string;
  example: string;
  exampleTitle: string;
  emptyTitle: string;
  emptyText: string;
  pages: string;
  progress: string;
  reviewed: string;
  privacy: string;
};

export function DocumentsView({ documents }: { documents: DocumentSummary[] }) {
  const messages = useTranslations();
  const t = messages.documents;
  const labels = messages.labels;
  const { locale } = useLanguage();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openExample() {
    setBusy(true);
    setError(null);
    try {
      const { input, scan } = await buildExample(t.exampleTitle);
      const result = await createDocumentAction(input);
      if (!result.ok) {
        setError(messages.errors[result.error]);
        return;
      }
      const page = result.data.pages[0];
      if (page) await putScan(page.id, scan);
      router.push(`/documents/${result.data.document.id}`);
    } finally {
      setBusy(false);
    }
  }

  const exampleButton = (
    <Button
      variant="outline"
      disabled={busy}
      onClick={() => void openExample()}
    >
      {t.example}
    </Button>
  );

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader eyebrow={t.eyebrow} title={t.title}>
        {documents.length > 0 && exampleButton}
        <LinkButton href="/documents/new" variant="primary">
          + {t.newDocument}
        </LinkButton>
      </PageHeader>
      <ErrorLine message={error} />

      {documents.length === 0 ? (
        <EmptyState title={t.emptyTitle} description={t.emptyText}>
          <div className="flex flex-wrap gap-2">
            <LinkButton href="/documents/new" variant="primary">
              + {t.newDocument}
            </LinkButton>
            {exampleButton}
          </div>
        </EmptyState>
      ) : (
        <ul className="sheet divide-y divide-line">
          {documents.map((d) => {
            const done = d.pages > 0 && d.reviewed === d.pages;
            return (
              <li key={d.id}>
                <Link
                  href={`/documents/${d.id}`}
                  className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4 transition-colors hover:bg-sunken"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-display text-lg font-semibold">
                      {d.title}
                    </div>
                    <div className="text-sm text-muted">
                      {labels.doctype[d.doctype]} · {labels.target[d.target]} ·{" "}
                      {formatDate(d.updatedAt, LOCALE_TAG[locale])}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-muted">
                      {fill(t.pages, { n: d.pages })}
                    </span>
                    <span className="pill bg-accent-soft text-accent">
                      {fill(t.progress, {
                        translated: d.translated,
                        pages: d.pages,
                      })}
                    </span>
                    <span
                      className={`pill ${done ? "bg-ok-soft text-ok" : "bg-info-soft text-info"}`}
                    >
                      {fill(t.reviewed, {
                        reviewed: d.reviewed,
                        pages: d.pages,
                      })}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-6 max-w-[70ch] text-sm text-muted">{t.privacy}</p>
    </div>
  );
}
