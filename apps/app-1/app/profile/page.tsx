"use client";

/**
 * `/profile` — the signed-in user's preferences ({@link ProfileView}). Room for
 * more sections later (CSV import, …).
 */

import { useTranslations } from "@/i18n";
import { ProfileView } from "./ProfileView";

export default function ProfilePage() {
  return <ProfileView t={useTranslations().profile} />;
}
