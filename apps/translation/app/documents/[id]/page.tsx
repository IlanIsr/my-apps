import { notFound } from "next/navigation";
import { Suspense } from "react";

import { WorkbenchView } from "@/app/components/WorkbenchView";
import { requireOwner } from "@/lib/owner";
import { getDocument, getSettings, listGlossary } from "@/lib/store";
import { isUuid } from "@/lib/validate";

/** `/documents/[id]` — the workbench for one document. */
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ownerId = await requireOwner();
  if (!isUuid(id)) notFound();
  const [doc, glossary, settings] = await Promise.all([
    getDocument(ownerId, id),
    listGlossary(ownerId),
    getSettings(ownerId),
  ]);
  if (!doc) notFound();
  return (
    // `useSearchParams` (the `?run=1` auto-start) needs a Suspense boundary.
    <Suspense>
      <WorkbenchView
        key={doc.document.id}
        initial={doc}
        glossary={glossary}
        settings={settings}
      />
    </Suspense>
  );
}
