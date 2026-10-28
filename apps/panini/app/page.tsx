/**
 * The only page: loads the signed-in user's album (and what friends shared
 * with them) server-side and hands it to the client app (`PaniniApp`), which
 * shows the first-run setup when there's no album yet. The proxy guarantees a
 * session; everything is scoped to it. `?tab=friends` opens the "Amis" tab
 * (where a share link sends you after joining).
 */

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getCurrentUserId } from "@repo/auth/user";

import { getAlbum, getMyShare, getSharedWithMe } from "@/lib/store";

import { PaniniApp } from "./components/PaniniApp";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/sign-in");
  const album = await getAlbum(userId);
  const friends = album
    ? await Promise.all([getMyShare(userId), getSharedWithMe(userId)]).then(
        ([myShare, shared]) => ({ myShare, shared }),
      )
    : { myShare: null, shared: [] };

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const proto = h.get("x-forwarded-proto") ?? "https";
  const { tab } = await searchParams;

  return (
    <PaniniApp
      initialAlbum={album}
      initialFriends={friends}
      origin={`${proto}://${host}`}
      initialTab={tab === "friends" ? "friends" : undefined}
    />
  );
}
