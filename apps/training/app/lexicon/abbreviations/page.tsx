import { requireOwner } from "@/lib/owner";
import { listAbbreviations } from "@/lib/study-store";

import { AbbreviationsView } from "../../components/LexiconView";

export default async function Page() {
  const entries = await listAbbreviations(await requireOwner());
  return <AbbreviationsView entries={entries} />;
}
