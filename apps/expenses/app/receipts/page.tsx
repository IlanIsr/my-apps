import {
  GROCERIES_KEY,
  monthOf,
  projectMonth,
  summarize,
} from "@/lib/expense-logic";
import { listCategories, listTransactions } from "@/lib/expense-store";
import { today } from "@/lib/grocery-logic";
import { requireOwner } from "@/lib/owner";
import { listReceipts, listStores } from "@/lib/store";

import { ReceiptsView } from "../components/ReceiptsView";

export default async function Page() {
  const owner = await requireOwner();
  const categories = await listCategories(owner);
  const [receipts, stores, transactions] = await Promise.all([
    listReceipts(owner),
    listStores(owner),
    listTransactions(owner),
  ]);
  const groceries = categories.find((c) => c.key === GROCERIES_KEY);
  const month = monthOf(today());
  const spent =
    summarize(
      transactions.filter((x) => monthOf(x.date) === month),
    ).byCategory.get(groceries?.id ?? null) ?? 0;
  return (
    <ReceiptsView
      receipts={receipts}
      stores={stores}
      month={{
        spent: groceries ? spent : 0,
        budget: groceries?.budget ?? null,
        projection: projectMonth(spent, month, today()),
      }}
    />
  );
}
