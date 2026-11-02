import { listCategories } from "@/lib/expense-store";
import { requireOwner } from "@/lib/owner";

import { CategoriesView } from "../components/CategoriesView";

export default async function Page() {
  const owner = await requireOwner();
  return <CategoriesView categories={await listCategories(owner)} />;
}
