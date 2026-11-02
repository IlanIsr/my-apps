import {
  listCategories,
  listGoals,
  listRules,
  listTransactions,
} from "@/lib/expense-store";
import { requireOwner } from "@/lib/owner";

import { TransactionsView } from "./components/TransactionsView";

/** Home: this month's expenses + quick add. */
export default async function Page() {
  const owner = await requireOwner();
  // Categories first: the first visit creates them (and the receipts' expenses).
  const categories = await listCategories(owner);
  const [transactions, rules, goals] = await Promise.all([
    listTransactions(owner),
    listRules(owner),
    listGoals(owner),
  ]);
  return (
    <TransactionsView
      transactions={transactions}
      categories={categories}
      rules={rules}
      goals={goals}
    />
  );
}
