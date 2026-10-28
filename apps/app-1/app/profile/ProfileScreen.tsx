"use client";

/** Client root of `/profile` — resolves the texts for {@link ProfileView}. */

import { useTranslations } from "@/i18n";
import { ProfileView } from "./ProfileView";

export function ProfileScreen({
  showCalendarFeed,
}: {
  showCalendarFeed: boolean;
}) {
  return (
    <ProfileView
      t={useTranslations().profile}
      showCalendarFeed={showCalendarFeed}
    />
  );
}
