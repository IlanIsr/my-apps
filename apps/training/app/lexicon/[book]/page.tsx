import { notFound } from "next/navigation";

import { requireOwner } from "@/lib/owner";
import { masekhetOf } from "@/lib/study-logic";
import { listLexicon } from "@/lib/study-store";

import { LexiconView } from "../../components/LexiconView";

/** `?amud=` opens the lexicon on one amud. */
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ book: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const [{ book }, query] = await Promise.all([params, searchParams]);
  const m = masekhetOf(decodeURIComponent(book));
  if (!m) notFound();
  const amud = Number(query.amud);
  const entries = await listLexicon(await requireOwner(), m.key);
  return (
    <LexiconView
      book={m.key}
      entries={entries}
      amud={
        Number.isInteger(amud) && amud >= m.first && amud <= m.last
          ? amud
          : null
      }
    />
  );
}
