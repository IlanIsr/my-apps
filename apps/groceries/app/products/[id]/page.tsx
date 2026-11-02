import { notFound } from "next/navigation";

import { requireOwner } from "@/lib/owner";
import {
  listPricePoints,
  listProducts,
  listShopping,
  listStores,
} from "@/lib/store";
import { isUuid } from "@/lib/validate";

import { ProductView } from "../../components/ProductView";

export default async function Page({ params }: PageProps<"/products/[id]">) {
  const owner = await requireOwner();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const [products, stores, points, shopping] = await Promise.all([
    listProducts(owner),
    listStores(owner),
    listPricePoints(owner),
    listShopping(owner),
  ]);
  const product = products.find((p) => p.id === id);
  if (!product) notFound();
  return (
    <ProductView
      product={product}
      stores={stores}
      points={points.filter((p) => p.productId === id)}
      inList={shopping.some((s) => s.productId === id)}
    />
  );
}
