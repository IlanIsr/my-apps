/**
 * Next.js 16 network-boundary handler (the renamed "middleware"). Delegates to
 * the shared Clerk proxy, which gates every route behind a session. `config`
 * must be a literal here — Next can't read `matcher` through the re-export.
 */

import { clerkProxy } from "@repo/auth/proxy";

export default clerkProxy;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
