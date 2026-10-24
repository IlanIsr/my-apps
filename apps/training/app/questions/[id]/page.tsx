import { notFound } from "next/navigation";

import { getQuestion } from "@/lib/store";
import { requireOwner } from "@/lib/owner";
import { isUuid } from "@/lib/validate";

import { QuestionFormView } from "../../components/QuestionFormView";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const owner = await requireOwner();
  const question = isUuid(id) ? await getQuestion(owner, id) : null;
  if (!question) notFound();
  return <QuestionFormView initial={question} />;
}
