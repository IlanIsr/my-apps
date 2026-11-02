import { requireOwner } from "@/lib/owner";
import { listReceipts, listStores } from "@/lib/store";

import { StoresView } from "../components/StoresView";

export default async function Page() {
  const owner = await requireOwner();
  const [stores, receipts] = await Promise.all([
    listStores(owner),
    listReceipts(owner),
  ]);
  return <StoresView stores={stores} receipts={receipts} />;
}
