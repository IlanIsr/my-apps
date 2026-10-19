/**
 * The only page: loads the signed-in user's album server-side and hands it to
 * the client app (`PaniniApp`), which shows the first-run setup when there's
 * none yet. The proxy guarantees a session; the album is scoped to it.
 */

import { redirect } from "next/navigation";

import { getCurrentUserId } from "@repo/auth/user";

import { getAlbum } from "@/lib/store";

import { PaniniApp } from "./components/PaniniApp";

export default async function Page() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/sign-in");
  const album = await getAlbum(userId);
  return <PaniniApp initialAlbum={album} />;
}
