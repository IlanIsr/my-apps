import { DocumentsView } from "@/app/components/DocumentsView";
import { requireOwner } from "@/lib/owner";
import { listDocuments } from "@/lib/store";

/** `/` — the user's documents. */
export default async function Page() {
  const ownerId = await requireOwner();
  return <DocumentsView documents={await listDocuments(ownerId)} />;
}
