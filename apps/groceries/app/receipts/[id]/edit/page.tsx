import { notFound } from "next/navigation";

import { lastListedPrices } from "@/lib/last-prices";
import { requireOwner } from "@/lib/owner";
import {
  getReceipt,
  listPricePoints,
  listProducts,
  listStores,
} from "@/lib/store";
import { isUuid } from "@/lib/validate";

import { ReceiptFormView } from "../../../components/ReceiptFormView";

export default async function Page({
  params,
}: PageProps<"/receipts/[id]/edit">) {
  const owner = await requireOwner();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const [receipt, stores, products, points] = await Promise.all([
    getReceipt(owner, id),
    listStores(owner),
    listProducts(owner),
    listPricePoints(owner),
  ]);
  if (!receipt) notFound();
  return (
    <ReceiptFormView
      receipt={receipt}
      stores={stores}
      products={products}
      lastPrices={lastListedPrices(points)}
    />
  );
}
