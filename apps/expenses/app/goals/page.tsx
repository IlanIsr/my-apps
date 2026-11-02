import {
  listCategories,
  listGoals,
  listTransactions,
} from "@/lib/expense-store";
import { requireOwner } from "@/lib/owner";

import { GoalsView } from "../components/GoalsView";

export default async function Page() {
  const owner = await requireOwner();
  const categories = await listCategories(owner);
  const [goals, transactions] = await Promise.all([
    listGoals(owner),
    listTransactions(owner),
  ]);
  return (
    <GoalsView
      goals={goals}
      transactions={transactions}
      categories={categories}
    />
  );
}
