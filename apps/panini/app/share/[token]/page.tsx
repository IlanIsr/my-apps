/**
 * Where a share link lands: shows whose album it is and lets the signed-in
 * viewer add it to their "Amis" tab (optionally sharing theirs back). The
 * token is the credential; an unknown / replaced one shows "invalid".
 */

import { redirect } from "next/navigation";

import { getCurrentUserId } from "@repo/auth/user";

import { getSharePreview } from "@/lib/store";

import { ShareJoinView } from "./ShareJoinView";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const userId = await getCurrentUserId();
  if (!userId) redirect("/sign-in");
  const preview = UUID.test(token)
    ? await getSharePreview(token, userId)
    : null;
  return <ShareJoinView token={token} preview={preview} />;
}
