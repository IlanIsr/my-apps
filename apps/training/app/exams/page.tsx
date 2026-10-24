import { listExams } from "@/lib/store";
import { requireOwner } from "@/lib/owner";

import { HistoryView } from "../components/HistoryView";

export default async function Page() {
  const exams = await listExams(await requireOwner());
  return <HistoryView exams={exams} />;
}
