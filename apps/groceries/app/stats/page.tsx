import { requireOwner } from "@/lib/owner";
import {
  listPricePoints,
  listProducts,
  listReceipts,
  listStores,
} from "@/lib/store";

import { StatsView } from "../components/StatsView";

export default async function Page() {
  const owner = await requireOwner();
  const [receipts, points, stores, products] = await Promise.all([
    listReceipts(owner),
    listPricePoints(owner),
    listStores(owner),
    listProducts(owner),
  ]);
  return (
    <StatsView
      receipts={receipts}
      points={points}
      stores={stores}
      products={products}
    />
  );
}
