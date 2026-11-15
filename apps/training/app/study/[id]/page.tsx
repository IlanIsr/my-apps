import { notFound } from "next/navigation";

import { requireOwner } from "@/lib/owner";
import { getPlan, listNotes } from "@/lib/study-store";
import { isUuid } from "@/lib/validate";

import { PlanView } from "../../components/PlanView";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const owner = await requireOwner();
  const [plan, notes] = isUuid(id)
    ? await Promise.all([getPlan(owner, id), listNotes(owner)])
    : [null, []];
  if (!plan) notFound();
  // Notes written from this plan, or on a passage it covers.
  const related = notes.filter(
    (n) =>
      n.planId === plan.id ||
      (n.book === plan.book &&
        n.startAmud <= plan.endAmud &&
        n.endAmud >= plan.startAmud),
  );
  return <PlanView plan={plan} notes={related} />;
}
