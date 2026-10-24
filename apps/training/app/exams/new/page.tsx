import { listExams, listQuestions } from "@/lib/store";
import { requireOwner } from "@/lib/owner";

import { GenerateView } from "../../components/GenerateView";

export default async function Page() {
  const owner = await requireOwner();
  const [bank, exams] = await Promise.all([
    listQuestions(owner),
    listExams(owner),
  ]);
  return <GenerateView bank={bank} exams={exams} />;
}
