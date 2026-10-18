/**
 * `/admin` route. 404s for anyone not in `ANNIVERSARIES_ADMIN_EMAILS`; renders
 * {@link AdminView}, telling it whether prod → pre-prod sync is available here.
 */

import { notFound } from "next/navigation";

import { getCurrentUserEmail } from "@repo/auth/user";
import { canSyncFromProd, isAnniversariesAdmin } from "@repo/anniversaries";

import { AdminView } from "./AdminView";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const email = await getCurrentUserEmail();
  if (!email || !isAnniversariesAdmin(email)) notFound();

  return <AdminView canSync={canSyncFromProd()} />;
}
