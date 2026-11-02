import {
  listCategories,
  listRules,
  listTransactions,
} from "@/lib/expense-store";
import { requireOwner } from "@/lib/owner";

import { ImportView } from "../components/ImportView";

export default async function Page() {
  const owner = await requireOwner();
  const categories = await listCategories(owner);
  const [transactions, rules] = await Promise.all([
    listTransactions(owner),
    listRules(owner),
  ]);
  return (
    <ImportView
      transactions={transactions}
      categories={categories}
      rules={rules}
    />
  );
}
