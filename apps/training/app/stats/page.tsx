import { listExams, listQuestions } from "@/lib/store";
import { requireOwner } from "@/lib/owner";

import { StatsView } from "../components/StatsView";

export default async function Page() {
  const owner = await requireOwner();
  const [bank, exams] = await Promise.all([
    listQuestions(owner),
    listExams(owner),
  ]);
  return <StatsView bank={bank} exams={exams} />;
}
