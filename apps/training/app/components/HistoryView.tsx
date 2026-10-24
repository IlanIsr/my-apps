"use client";

/**
 * `/exams` — past exams, newest first: date, size, status (in progress / to
 * correct / corrected), the result bar, and delete. Route boundary: reads its
 * texts.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { SimpleModal } from "@repo/ui/modal";

import { deleteExamAction } from "@/app/actions";
import { useLanguage, useTranslations, LOCALE_TAG } from "@/i18n";
import { examCounts, type Exam } from "@/lib/exam-logic";

import { Button } from "./Button";
import {
  EmptyState,
  ErrorLine,
  fill,
  formatDate,
  LinkButton,
  PageHeader,
} from "./common";
import { ResultBar } from "./Results";

export type HistoryTexts = {
  eyebrow: string;
  title: string;
  newExam: string;
  count: string;
  score: string;
  retryOf: string;
  status: { active: string; toCorrect: string; corrected: string };
  delete: string;
  deleteConfirm: {
    title: string;
    description: string;
    cancel: string;
    confirm: string;
  };
  empty: { title: string; description: string };
};

function statusOf(exam: Exam): keyof HistoryTexts["status"] {
  if (exam.status === "active") return "active";
  return exam.reviewedAt ? "corrected" : "toCorrect";
}

const STATUS_TONE = {
  active: "bg-accent-soft text-accent",
  toCorrect: "bg-pencil-soft text-pencil",
  corrected: "bg-ok-soft text-ok",
};

export function HistoryView({ exams }: { exams: Exam[] }) {
  const messages = useTranslations();
  const t = messages.history;
  const { locale } = useLanguage();
  const router = useRouter();
  const [toDelete, setToDelete] = useState<Exam | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmDelete() {
    if (!toDelete) return;
    setBusy(true);
    const result = await deleteExamAction(toDelete.id);
    setBusy(false);
    if (!result.ok) {
      setError(messages.errors[result.error]);
      return;
    }
    setToDelete(null);
    router.refresh();
  }

  return (
    <>
      <PageHeader eyebrow={t.eyebrow} title={t.title}>
        <LinkButton href="/exams/new" variant="primary">
          {t.newExam}
        </LinkButton>
      </PageHeader>

      <ErrorLine message={error} />

      {exams.length === 0 ? (
        <EmptyState title={t.empty.title} description={t.empty.description} />
      ) : (
        <ul className="space-y-3">
          {exams.map((exam) => {
            const counts = examCounts(exam);
            const status = statusOf(exam);
            const rated = counts.correct + counts.partial + counts.incorrect;
            return (
              <li
                key={exam.id}
                className="sheet flex items-center gap-3 px-4 py-3"
              >
                <Link
                  href={`/exams/${exam.id}`}
                  className="min-w-0 flex-1 space-y-2"
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-medium">
                      {formatDate(exam.startedAt, LOCALE_TAG[locale])}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE[status]}`}
                    >
                      {t.status[status]}
                    </span>
                    {exam.sourceExamId && (
                      <span className="text-xs text-muted">↻ {t.retryOf}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <ResultBar counts={counts} className="flex-1" />
                    <span className="font-mono text-xs whitespace-nowrap text-muted">
                      {rated > 0
                        ? fill(t.score, {
                            correct: counts.correct,
                            total: exam.questions.length,
                          })
                        : fill(t.count, { count: exam.questions.length })}
                    </span>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={t.delete}
                  onClick={() => setToDelete(exam)}
                >
                  ✕
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      <SimpleModal
        isOpen={toDelete !== null}
        onClose={() => setToDelete(null)}
        isDismissable={!busy}
        title={t.deleteConfirm.title}
        description={t.deleteConfirm.description}
        footer={
          <>
            <Button variant="ghost" onClick={() => setToDelete(null)}>
              {t.deleteConfirm.cancel}
            </Button>
            <Button variant="danger" disabled={busy} onClick={confirmDelete}>
              {t.deleteConfirm.confirm}
            </Button>
          </>
        }
      />
    </>
  );
}
