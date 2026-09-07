/**
 * `/` route. Signed-in visitors are sent straight to the app; signed-out
 * visitors (including a Google OAuth reviewer) get a public landing page that
 * explains what Anniversaries is, why it uses Google Calendar, and how to sign
 * in — with a visible link to the privacy policy. No authenticated data is
 * rendered here.
 */

import { redirect } from "next/navigation";

import { getCurrentUserId } from "@repo/auth/user";

import { LandingView } from "./LandingView";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const userId = await getCurrentUserId();
  if (userId) redirect("/anniversaries");
  return <LandingView />;
}
