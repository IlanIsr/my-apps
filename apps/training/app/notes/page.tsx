import { requireOwner } from "@/lib/owner";
import { listNotes } from "@/lib/study-store";

import { NotesView } from "../components/NotesView";

export default async function Page() {
  const notes = await listNotes(await requireOwner());
  return <NotesView notes={notes} />;
}
