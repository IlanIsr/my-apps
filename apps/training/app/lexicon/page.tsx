import { requireOwner } from "@/lib/owner";
import { lexiconCounts } from "@/lib/study-store";

import { LexiconIndexView } from "../components/LexiconView";

export default async function Page() {
  const counts = await lexiconCounts(await requireOwner());
  return <LexiconIndexView counts={counts} />;
}
