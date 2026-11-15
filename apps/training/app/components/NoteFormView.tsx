"use client";

/**
 * `/notes/new` and `/notes/[id]` — one note: the passage it's on, a title and
 * its rich text. A new note can come pre-filled from a plan's session
 * (`?plan=&book=&start=&end=`). Route boundary: reads its texts.
 */

import { useRouter } from "next/navigation";
import { useState } from "react";

import { SimpleModal } from "@repo/ui/modal";

import {
  createNoteAction,
  deleteNoteAction,
  updateNoteAction,
} from "@/app/actions";
import { useLanguage, useTranslations } from "@/i18n";
import { EMPTY_DOC, type Note, type RichDoc } from "@/lib/study-logic";

import { Button } from "./Button";
import { ErrorLine, PageHeader } from "./common";
import {
  PassagePicker,
  type Passage,
  type PassagePickerTexts,
} from "./PassagePicker";
import { RichEditor, type RichEditorTexts } from "./RichEditor";
import { TextInput } from "./TextInput";

export type NoteFormTexts = {
  eyebrow: string;
  newTitle: string;
  editTitle: string;
  passage: PassagePickerTexts;
  title: string;
  titlePlaceholder: string;
  content: string;
  editor: RichEditorTexts;
  save: string;
  saved: string;
  backToPlan: string;
  delete: string;
  deleteConfirm: {
    title: string;
    description: string;
    cancel: string;
    confirm: string;
  };
};

export function NoteFormView({
  note,
  initial,
  planId,
}: {
  /** The note being edited; absent for a new one. */
  note?: Note;
  /** A new note's passage. */
  initial: Passage;
  planId: string | null;
}) {
  const messages = useTranslations();
  const t = messages.noteForm;
  const { locale } = useLanguage();
  const router = useRouter();

  const [passage, setPassage] = useState<Passage>(
    note
      ? { book: note.book, startAmud: note.startAmud, endAmud: note.endAmud }
      : initial,
  );
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState<RichDoc>(note?.content ?? EMPTY_DOC);
  const [text, setText] = useState(note?.text ?? "");
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedOnce, setSavedOnce] = useState(false);

  const linkedPlan = note?.planId ?? planId;

  async function save() {
    setBusy(true);
    setError(null);
    const input = {
      subject: "gemara",
      ...passage,
      planId: linkedPlan,
      title,
      content,
      text,
    };
    const result = note
      ? await updateNoteAction(note.id, input)
      : await createNoteAction(input);
    setBusy(false);
    if (!result.ok) {
      setError(messages.errors[result.error]);
      return;
    }
    setDirty(false);
    setSavedOnce(true);
    if (!note) router.replace(`/notes/${result.data.id}`);
  }

  async function confirmDelete() {
    if (!note) return;
    setBusy(true);
    const result = await deleteNoteAction(note.id);
    if (!result.ok) {
      setBusy(false);
      setError(messages.errors[result.error]);
      return;
    }
    router.push(linkedPlan ? `/study/${linkedPlan}` : "/notes");
  }

  return (
    <>
      <PageHeader eyebrow={t.eyebrow} title={note ? t.editTitle : t.newTitle}>
        {linkedPlan && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => router.push(`/study/${linkedPlan}`)}
          >
            {t.backToPlan}
          </Button>
        )}
        {note && (
          <Button size="sm" variant="ghost" onClick={() => setDeleting(true)}>
            {t.delete}
          </Button>
        )}
      </PageHeader>

      <div className="space-y-5">
        <div className="sheet p-4">
          <PassagePicker
            value={passage}
            onChange={(p) => {
              setPassage(p);
              setDirty(true);
            }}
            hebrew={locale === "he"}
            t={t.passage}
          />
        </div>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">{t.title}</span>
          <TextInput
            value={title}
            dir="auto"
            placeholder={t.titlePlaceholder}
            onChange={(e) => {
              setTitle(e.target.value);
              setDirty(true);
            }}
          />
        </label>

        <div className="space-y-1.5">
          <span className="text-sm font-medium">{t.content}</span>
          <RichEditor
            content={content}
            onChange={(doc, plain) => {
              setContent(doc);
              setText(plain);
              setDirty(true);
            }}
            t={t.editor}
          />
        </div>

        <ErrorLine message={error} />

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            disabled={busy || (!dirty && !!note)}
            onClick={save}
          >
            {t.save}
          </Button>
          {savedOnce && !dirty && (
            <span className="text-sm text-ok">{t.saved}</span>
          )}
        </div>
      </div>

      <SimpleModal
        isOpen={deleting}
        onClose={() => setDeleting(false)}
        isDismissable={!busy}
        title={t.deleteConfirm.title}
        description={t.deleteConfirm.description}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleting(false)}>
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
