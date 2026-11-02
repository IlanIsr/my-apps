import { lastListedPrices } from "@/lib/last-prices";
import { requireOwner } from "@/lib/owner";
import { listPricePoints, listProducts, listStores } from "@/lib/store";

import { ReceiptFormView } from "../../components/ReceiptFormView";

export default async function Page() {
  const owner = await requireOwner();
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
    />
  );
}
