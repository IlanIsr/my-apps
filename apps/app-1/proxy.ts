/**
 * Next.js 16 network-boundary handler (the renamed "middleware"). Delegates to
 * the shared Clerk proxy, which gates every route behind a session — except the
 * public landing page (`/`, also at `/about`) and privacy policy (`/privacy`), which must be
 * reachable without signing in (Google OAuth verification), and the calendar
 * feeds (`/feed/<token>.ics` — calendar apps have no session; the token is the
 * credential). `config` must be a literal here — Next can't read `matcher`
 * through the re-export.
 */

import { createClerkProxy } from "@repo/auth/proxy";

export default createClerkProxy(["/", "/about", "/privacy", "/feed"]);

export const config = {
  matcher: [
    // Excludes static-asset extensions and Next's generated metadata-route
    // icons (`/icon`, `/apple-icon`, …) — those are extensionless, so a
    // signed-out request must still get the image, not a sign-in redirect.
    "/((?!_next|(?:apple-icon|icon|opengraph-image|twitter-image)(?:$|\\?)|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
