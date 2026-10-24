/**
 * Next.js 16 network-boundary handler. Delegates to the shared Clerk proxy
 * (`@repo/auth/proxy`), gating every route behind a session — except the
 * home page (`/`, just links; each app gates itself) and the privacy policy
 * (`/privacy`), which must be public for the Google OAuth consent screen. `config.matcher` must be a literal here — Next can't read it
 * through the re-export.
 */

import { createClerkProxy } from "@repo/auth/proxy";

export default createClerkProxy(["/", "/privacy"]);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
