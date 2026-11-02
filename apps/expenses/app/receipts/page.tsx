import { requireOwner } from "@/lib/owner";
import { listReceipts, listStores } from "@/lib/store";

import { ReceiptsView } from "../components/ReceiptsView";

export default async function Page() {
  const owner = await requireOwner();
  const [receipts, stores] = await Promise.all([
    listReceipts(owner),
    listStores(owner),
  ]);
  return <ReceiptsView receipts={receipts} stores={stores} />;
}
