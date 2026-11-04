import { GlossaryView } from "@/app/components/GlossaryView";
import { requireOwner } from "@/lib/owner";
import { listGlossary } from "@/lib/store";

/** `/glossary` — the firm's glossary. */
export default async function Page() {
  const ownerId = await requireOwner();
  return <GlossaryView initial={await listGlossary(ownerId)} />;
}
