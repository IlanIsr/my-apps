import { listCategories } from "@/lib/expense-store";
import { lastListedPrices } from "@/lib/last-prices";
import { requireOwner } from "@/lib/owner";
import { listPricePoints, listProducts, listStores } from "@/lib/store";

import { ReceiptFormView } from "../../components/ReceiptFormView";

/** `?friend=1`: a friend's receipt (from the Products page's "+"). */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ friend?: string }>;
}) {
  const { friend } = await searchParams;
  const owner = await requireOwner();
  const categories = await listCategories(owner);
  const [stores, products, points] = await Promise.all([
    listStores(owner),
    listProducts(owner),
    listPricePoints(owner),
  ]);
  return (
    <ReceiptFormView
      receipt={null}
      stores={stores}
      products={products}
      lastPrices={lastListedPrices(points)}
      categories={categories}
      friend={friend === "1"}
    />
  );
}
