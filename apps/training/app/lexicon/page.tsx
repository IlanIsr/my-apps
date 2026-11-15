import { requireOwner } from "@/lib/owner";
import { lexiconCounts, listAbbreviations } from "@/lib/study-store";

import { LexiconIndexView } from "../components/LexiconView";

export default async function Page() {
  const owner = await requireOwner();
  const [counts, abbreviations] = await Promise.all([
    lexiconCounts(owner),
    listAbbreviations(owner),
  ]);
  return (
    <LexiconIndexView counts={counts} abbreviations={abbreviations.length} />
  );
}
