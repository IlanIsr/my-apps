import { notFound } from "next/navigation";

import { requireOwner } from "@/lib/owner";
import { getNote } from "@/lib/study-store";
import { isUuid } from "@/lib/validate";

import { NoteFormView } from "../../components/NoteFormView";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const owner = await requireOwner();
  const note = isUuid(id) ? await getNote(owner, id) : null;
  if (!note) notFound();
  return (
    <NoteFormView
      key={note.id}
      note={note}
      initial={{
        book: note.book,
        startAmud: note.startAmud,
        endAmud: note.endAmud,
      }}
      planId={note.planId}
    />
  );
}
