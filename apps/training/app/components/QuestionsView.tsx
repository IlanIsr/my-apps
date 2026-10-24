"use client";

/**
 * `/questions` — the question bank: search, a special / normal filter, and
 * one sheet per question with edit / delete. Route boundary: reads its texts.
 */

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { SimpleModal } from "@repo/ui/modal";

import { deleteQuestionAction } from "@/app/actions";
import { useTranslations } from "@/i18n";
import { matchesSearch, type Question } from "@/lib/exam-logic";

import { Button } from "./Button";
import { EmptyState, ErrorLine, fill, LinkButton, PageHeader } from "./common";
import {
  QuestionBody,
  QuestionMeta,
  type QuestionBodyTexts,
} from "./QuestionBody";
import { Segmented } from "./Segmented";
import { TextInput } from "./TextInput";

export type QuestionsTexts = {
  eyebrow: string;
  title: string;
  add: string;
  search: string;
  count: string;
  filter: { label: string; all: string; special: string; normal: string };
  edit: string;
  delete: string;
  withAnswer: string;
  deleteConfirm: {
    title: string;
    description: string;
    cancel: string;
    confirm: string;
  };
  empty: { title: string; description: string };
  noMatch: string;
};

type Filter = "all" | "special" | "normal";

export function QuestionsView({ bank }: { bank: Question[] }) {
  const messages = useTranslations();
  const t = messages.questions;
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [toDelete, setToDelete] = useState<Question | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shown = useMemo(
    () =>
      bank.filter(
        (q) =>
          matchesSearch(q, query) &&
          (filter === "all" || q.isSpecial === (filter === "special")),
      ),
    [bank, query, filter],
  );

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    const result = await deleteQuestionAction(toDelete.id);
    setDeleting(false);
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
        <LinkButton href="/questions/new" variant="primary">
          + {t.add}
        </LinkButton>
      </PageHeader>

      {bank.length === 0 ? (
        <EmptyState title={t.empty.title} description={t.empty.description}>
          <LinkButton href="/questions/new" variant="primary">
            + {t.add}
          </LinkButton>
        </EmptyState>
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <TextInput
                type="search"
                placeholder={t.search}
                aria-label={t.search}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Segmented
              aria-label={t.filter.label}
              value={filter}
              onChange={setFilter}
              options={[
                { value: "all", label: t.filter.all },
                { value: "special", label: t.filter.special },
                { value: "normal", label: t.filter.normal },
              ]}
            />
          </div>

          <p className="eyebrow mb-3">
            {fill(t.count, { count: shown.length })}
          </p>
          <ErrorLine message={error} />

          {shown.length === 0 ? (
            <p className="text-muted">{t.noMatch}</p>
          ) : (
            <ul className="space-y-3">
              {shown.map((q) => (
                <QuestionItem
                  key={q.id}
                  question={q}
                  t={t}
                  body={messages.questionBody}
                  onDelete={() => setToDelete(q)}
                />
              ))}
            </ul>
          )}
        </>
      )}

      <SimpleModal
        isOpen={toDelete !== null}
        onClose={() => setToDelete(null)}
        isDismissable={!deleting}
        title={t.deleteConfirm.title}
        description={t.deleteConfirm.description}
        footer={
          <>
            <Button variant="ghost" onClick={() => setToDelete(null)}>
              {t.deleteConfirm.cancel}
            </Button>
            <Button
              variant="danger"
              disabled={deleting}
              onClick={confirmDelete}
            >
              {t.deleteConfirm.confirm}
            </Button>
          </>
        }
      >
        {toDelete && (
          <p dir="auto" className="line-clamp-3 text-sm">
            {toDelete.prompts[0]}
          </p>
        )}
      </SimpleModal>
    </>
  );
}

function QuestionItem({
  question,
  t,
  body,
  onDelete,
}: {
  question: Question;
  t: QuestionsTexts;
  body: QuestionBodyTexts;
  onDelete: () => void;
}) {
  return (
    <li className="sheet ruled space-y-3 px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <QuestionMeta question={question} t={body} />
        <div className="ms-auto flex shrink-0 gap-1">
          <LinkButton
            href={`/questions/${question.id}`}
            variant="ghost"
            size="sm"
          >
            {t.edit}
          </LinkButton>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            {t.delete}
          </Button>
        </div>
      </div>
      <QuestionBody question={question} t={body} />
      {question.answer && <p className="eyebrow text-ok">✓ {t.withAnswer}</p>}
    </li>
  );
}
