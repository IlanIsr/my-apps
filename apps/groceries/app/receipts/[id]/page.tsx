import { notFound } from "next/navigation";

import { requireOwner } from "@/lib/owner";
import { getReceipt } from "@/lib/store";
import { isUuid } from "@/lib/validate";

import { ReceiptView } from "../../components/ReceiptView";

export default async function Page({ params }: PageProps<"/receipts/[id]">) {
  const owner = await requireOwner();
  const { id } = await params;
  const receipt = isUuid(id) ? await getReceipt(owner, id) : null;
  if (!receipt) notFound();
  return <ReceiptView receipt={receipt} />;
}
