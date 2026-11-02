import { requireOwner } from "@/lib/owner";
import { listDistinctPairs, listPricePoints, listProducts } from "@/lib/store";

import { DuplicatesView } from "../../components/DuplicatesView";

export default async function Page() {
  const owner = await requireOwner();
  const [products, points, distinctPairs] = await Promise.all([
    listProducts(owner),
    listPricePoints(owner),
    listDistinctPairs(owner),
  ]);
  return (
    <DuplicatesView
      products={products}
      points={points}
      distinctPairs={distinctPairs}
    />
  );
}
