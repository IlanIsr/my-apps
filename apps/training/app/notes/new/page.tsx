import { requireOwner } from "@/lib/owner";
import { masekhetOf } from "@/lib/study-logic";
import { getPlan } from "@/lib/study-store";
import { SHASS } from "@/lib/shass";
import { isUuid } from "@/lib/validate";

import { NoteFormView } from "../../components/NoteFormView";

/** `?plan=&book=&start=&end=` pre-fill the passage (from a plan's session). */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const query = await searchParams;
  const owner = await requireOwner();
  const plan = isUuid(query.plan) ? await getPlan(owner, query.plan) : null;
  const m = masekhetOf(query.book ?? plan?.book ?? "") ?? SHASS[0]!;
  const clamp = (value: string | undefined, fallback: number) => {
    const n = Number(value);
    return Number.isInteger(n) && n >= m.first && n <= m.last ? n : fallback;
  };
  const startAmud = clamp(query.start, m.first);
  const endAmud = Math.max(startAmud, clamp(query.end, startAmud));
  return (
    <NoteFormView
      initial={{ book: m.key, startAmud, endAmud }}
      planId={plan?.id ?? null}
    />
  );
}
