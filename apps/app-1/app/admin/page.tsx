import { notFound } from "next/navigation";

import { getCurrentUserEmail } from "@repo/auth/user";
import { isAnniversariesAdmin } from "@repo/anniversaries";

import { AdminView } from "./AdminView";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const email = await getCurrentUserEmail();
  if (!email || !isAnniversariesAdmin(email)) notFound();

  return <AdminView />;
}
