import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Shared Clerk network-boundary handler (Next.js 16 "proxy"). The whole app is
 * gated: every route except the sign-in flow redirects to `/sign-in` when there
 * is no session.
 *
 * Wire it up from each app's `proxy.ts` — the `config.matcher` must be a literal
 * in that file, Next.js can't read it through a re-export:
 *
 *   import { clerkProxy } from "@repo/auth/proxy";
 *   export default clerkProxy;
 *   export const config = { matcher: [ ... ] };
 */
export const clerkProxy = clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();
  const { pathname } = request.nextUrl;
  const isPublic =
    pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");

  if (!userId && !isPublic) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
});
