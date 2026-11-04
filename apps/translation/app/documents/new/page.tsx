import { NewDocumentView } from "@/app/components/NewDocumentView";
import { requireOwner } from "@/lib/owner";
import { getSettings } from "@/lib/store";

/** `/documents/new` — drop files, check pages, create the document. */
export default async function Page() {
  const ownerId = await requireOwner();
  return <NewDocumentView defaults={await getSettings(ownerId)} />;
}
