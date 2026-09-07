/**
 * Next.js 16 network-boundary handler (the renamed "middleware"). Delegates to
 * the shared Clerk proxy, which gates every route behind a session — except the
 * public landing page (`/`) and privacy policy (`/privacy`), which must be
 * reachable without signing in (Google OAuth verification). `config` must be a
 * literal here — Next can't read `matcher` through the re-export.
 */

import { createClerkProxy } from "@repo/auth/proxy";

export default createClerkProxy(["/", "/privacy"]);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
