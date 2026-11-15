import { requireOwner } from "@/lib/owner";
import { listPlans } from "@/lib/study-store";

import { StudyView } from "../components/StudyView";

export default async function Page() {
  const plans = await listPlans(await requireOwner());
  return <StudyView plans={plans} />;
}
