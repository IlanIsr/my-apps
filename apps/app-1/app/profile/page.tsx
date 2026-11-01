/**
 * `/profile` — the signed-in user's preferences ({@link ProfileScreen}). The
 * calendar-feed card is only shown to the users `canUseCalendarFeed` lets in.
 */

import { getCurrentUserId } from "@repo/auth/user";

import { canUseCalendarFeed } from "@/lib/calendar-feed";
import { ProfileScreen } from "./ProfileScreen";

export default async function ProfilePage() {
  const userId = await getCurrentUserId();
  return <ProfileScreen showCalendarFeed={canUseCalendarFeed(userId)} />;
}
