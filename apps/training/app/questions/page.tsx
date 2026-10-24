import { listQuestions } from "@/lib/store";
import { requireOwner } from "@/lib/owner";

import { QuestionsView } from "../components/QuestionsView";

export default async function Page() {
  const bank = await listQuestions(await requireOwner());
  return <QuestionsView bank={bank} />;
}
