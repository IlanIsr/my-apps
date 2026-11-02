import { requireOwner } from "@/lib/owner";
import {
  listDistinctPairs,
  listPricePoints,
  listProducts,
  listShopping,
  listStores,
} from "@/lib/store";
import { isUuid } from "@/lib/validate";

import { ProductsView } from "../components/ProductsView";

export default async function Page({ searchParams }: PageProps<"/products">) {
  const owner = await requireOwner();
  const { store } = await searchParams;
  const [products, stores, points, shopping, distinctPairs] = await Promise.all(
    [
      listProducts(owner),
      listStores(owner),
      listPricePoints(owner),
      listShopping(owner),
      listDistinctPairs(owner),
    ],
  );
  return (
    <ProductsView
      products={products}
      stores={stores}
      points={points}
      shoppingIds={shopping.map((s) => s.productId)}
      initialStoreId={isUuid(store) ? store : null}
      distinctPairs={distinctPairs}
    />
  );
}
