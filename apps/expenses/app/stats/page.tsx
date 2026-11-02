import { listCategories, listTransactions } from "@/lib/expense-store";
import { requireOwner } from "@/lib/owner";
import {
  listPricePoints,
  listProducts,
  listReceipts,
  listStores,
} from "@/lib/store";

import { BilanView } from "../components/BilanView";

export default async function Page() {
  const owner = await requireOwner();
  const categories = await listCategories(owner);
  const [transactions, receipts, points, stores, products] = await Promise.all([
    listTransactions(owner),
    listReceipts(owner),
    listPricePoints(owner),
    listStores(owner),
    listProducts(owner),
  ]);
  return (
    <BilanView
      transactions={transactions}
      categories={categories}
      receipts={receipts}
      points={points}
      stores={stores}
      products={products}
    />
  );
}
