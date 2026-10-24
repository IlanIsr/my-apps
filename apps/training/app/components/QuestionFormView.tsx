"use client";

/**
 * `/questions/new` and `/questions/[id]` — the question form. One shape for
 * every question: an optional case (switch), one or more prompts, an optional
 * answer (switch, off by default), siman / seif, the four sources and the
 * "special" flag. "Save and add another" keeps siman / seif / sources for the
 * next one. Route boundary: reads its texts.
 */

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createQuestionAction, updateQuestionAction } from "@/app/actions";
import { useTranslations } from "@/i18n";
import {
  emptySources,
  LIMITS,
  SOURCE_KEYS,
  type Question,
  type QuestionInput,
  type Sources,
} from "@/lib/exam-logic";

import { Button } from "./Button";
import { Checkbox } from "./Checkbox";
import { ErrorLine, LinkButton, PageHeader } from "./common";
import { letter } from "./QuestionBody";
import { Switch } from "./Switch";
import { TextArea } from "./TextArea";
import { TextInput } from "./TextInput";

export type QuestionFormTexts = {
  eyebrow: string;
  newTitle: string;
  editTitle: string;
  siman: string;
  seif: string;
  withCase: string;
  casePlaceholder: string;
  prompts: string;
  promptPlaceholder: string;
  addPrompt: string;
  removePrompt: string;
  withAnswer: string;
  answerPlaceholder: string;
  sources: string;
  special: string;
  specialHint: string;
  saveAndNext: string;
  save: string;
  cancel: string;
  saved: string;
  promptRequired: string;
  shortcut: string;
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="eyebrow">{label}</span>
      {children}
    </label>
  );
}

export function QuestionFormView({ initial }: { initial?: Question }) {
  const messages = useTranslations();
  const t = messages.questionForm;
  const body = messages.questionBody;
  const router = useRouter();

  const [siman, setSiman] = useState(initial?.siman ?? "");
  const [seif, setSeif] = useState(initial?.seif ?? "");
  const [hasCase, setHasCase] = useState(Boolean(initial?.cas));
  const [cas, setCas] = useState(initial?.cas ?? "");
  const [prompts, setPrompts] = useState<string[]>(initial?.prompts ?? [""]);
  const [hasAnswer, setHasAnswer] = useState(Boolean(initial?.answer));
  const [answer, setAnswer] = useState(initial?.answer ?? "");
  const [sources, setSources] = useState<Sources>(
    initial?.sources ?? emptySources(),
  );
  const [isSpecial, setIsSpecial] = useState(initial?.isSpecial ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function setPrompt(index: number, value: string) {
    setPrompts((list) => list.map((p, i) => (i === index ? value : p)));
  }

  async function save(next: boolean) {
    const input: QuestionInput = {
      siman,
      seif,
      cas: hasCase ? cas : null,
      prompts: prompts.filter((p) => p.trim()),
      answer: hasAnswer ? answer : null,
      sources,
      isSpecial,
    };
    if (input.prompts.length === 0) {
      setError(t.promptRequired);
      return;
    }
    setSaving(true);
    setError(null);
    const result = initial
      ? await updateQuestionAction(initial.id, input)
      : await createQuestionAction(input);
    setSaving(false);
    if (!result.ok) {
      setError(messages.errors[result.error]);
      return;
    }
    if (next) {
      // Keep the reference fields; clear the content.
      setCas("");
      setHasCase(false);
      setPrompts([""]);
      setAnswer("");
      setHasAnswer(false);
      setIsSpecial(false);
      setNotice(t.saved);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push("/questions");
    }
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        void save(!initial);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          void save(!initial);
        }
      }}
    >
      <PageHeader
        eyebrow={t.eyebrow}
        title={initial ? t.editTitle : t.newTitle}
      />

      {notice && (
        <p
          role="status"
          className="rounded-md bg-ok-soft px-3 py-2 text-sm text-ok"
        >
          ✓ {notice}
        </p>
      )}

      <section className="sheet ruled space-y-5 px-5 py-5">
        <div className="grid grid-cols-2 gap-3">
          <Field label={t.siman}>
            <TextInput
              value={siman}
              maxLength={LIMITS.short}
              onChange={(e) => setSiman(e.target.value)}
            />
          </Field>
          <Field label={t.seif}>
            <TextInput
              value={seif}
              maxLength={LIMITS.short}
              onChange={(e) => setSeif(e.target.value)}
            />
          </Field>
        </div>

        <div className="space-y-2">
          <Switch checked={hasCase} onChange={setHasCase}>
            {t.withCase}
          </Switch>
          {hasCase && (
            <TextArea
              dir="auto"
              rows={4}
              aria-label={body.case}
              placeholder={t.casePlaceholder}
              value={cas}
              maxLength={LIMITS.text}
              onChange={(e) => setCas(e.target.value)}
            />
          )}
        </div>

        <div className="space-y-2">
          <span className="eyebrow">{t.prompts}</span>
          <ol className="space-y-2">
            {prompts.map((prompt, i) => (
              <li key={i} className="flex items-start gap-2">
                {prompts.length > 1 && (
                  <span className="mt-2.5 w-5 font-mono text-sm text-muted">
                    {letter(body.letters, i)}.
                  </span>
                )}
                <div className="flex-1">
                  <TextArea
                    dir="auto"
                    rows={2}
                    aria-label={`${t.prompts} ${i + 1}`}
                    placeholder={t.promptPlaceholder}
                    value={prompt}
                    maxLength={LIMITS.text}
                    autoFocus={i === prompts.length - 1 && i > 0}
                    onChange={(e) => setPrompt(i, e.target.value)}
                  />
                </div>
                {prompts.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={t.removePrompt}
                    onClick={() =>
                      setPrompts((list) => list.filter((_, j) => j !== i))
                    }
                  >
                    ✕
                  </Button>
                )}
              </li>
            ))}
          </ol>
          {prompts.length < LIMITS.prompts && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPrompts((list) => [...list, ""])}
            >
              + {t.addPrompt}
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <Switch checked={hasAnswer} onChange={setHasAnswer}>
            {t.withAnswer}
          </Switch>
          {hasAnswer && (
            <TextArea
              dir="auto"
              rows={3}
              aria-label={body.answer}
              placeholder={t.answerPlaceholder}
              value={answer}
              maxLength={LIMITS.text}
              onChange={(e) => setAnswer(e.target.value)}
            />
          )}
        </div>
      </section>

      <section className="sheet space-y-4 px-5 py-5">
        <span className="eyebrow">{t.sources}</span>
        <div className="grid gap-3 sm:grid-cols-2">
          {SOURCE_KEYS.map((key) => (
            <Field key={key} label={body.sources[key]}>
              <TextInput
                dir="auto"
                value={sources[key]}
                maxLength={LIMITS.short}
                onChange={(e) =>
                  setSources((s) => ({ ...s, [key]: e.target.value }))
                }
              />
            </Field>
          ))}
        </div>
        <div>
          <Checkbox checked={isSpecial} onChange={setIsSpecial}>
            <span className="text-sm">
              <span className="font-medium">★ {t.special}</span>
              <span className="block text-muted">{t.specialHint}</span>
            </span>
          </Checkbox>
        </div>
      </section>

      <ErrorLine message={error} />

      <div className="flex flex-wrap items-center gap-2">
        {initial ? (
          <Button type="submit" variant="primary" disabled={saving}>
            {t.save}
          </Button>
        ) : (
          <>
            <Button type="submit" variant="primary" disabled={saving}>
              {t.saveAndNext}
            </Button>
            <Button disabled={saving} onClick={() => void save(false)}>
              {t.save}
            </Button>
          </>
        )}
        <LinkButton href="/questions" variant="ghost">
          {t.cancel}
        </LinkButton>
        <span className="ms-auto hidden text-xs text-muted sm:inline">
          {t.shortcut}
        </span>
      </div>
    </form>
  );
}
