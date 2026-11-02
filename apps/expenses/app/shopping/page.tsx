import { requireOwner } from "@/lib/owner";
import {
  listPricePoints,
  listProducts,
  listShopping,
  listStores,
} from "@/lib/store";

import { ShoppingView } from "../components/ShoppingView";

export default async function Page() {
  const owner = await requireOwner();
  const [items, products, stores, points] = await Promise.all([
    listShopping(owner),
    listProducts(owner),
    listStores(owner),
    listPricePoints(owner),
  ]);
  return (
    <ShoppingView
      items={items}
      products={products}
      stores={stores}
      points={points}
    />
  );
}
