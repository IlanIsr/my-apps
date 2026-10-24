import { notFound } from "next/navigation";

import { getExam } from "@/lib/store";
import { requireOwner } from "@/lib/owner";
import { isUuid } from "@/lib/validate";

import { ExamView } from "../../components/ExamView";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const owner = await requireOwner();
  const exam = isUuid(id) ? await getExam(owner, id) : null;
  if (!exam) notFound();
  // `key`: a "redo my mistakes" navigation mounts a fresh view.
  return <ExamView key={exam.id} initialExam={exam} />;
}
