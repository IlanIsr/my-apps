import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Shared Clerk network-boundary handler (Next.js 16 "proxy"). By default the
 * whole app is gated: every route except the sign-in / sign-up flow redirects
 * to `/sign-in` when there is no session.
 *
 * An app can allow extra unauthenticated routes by calling
 * {@link createClerkProxy} with a list of public path prefixes (e.g. a public
 * landing page or a privacy policy needed for OAuth verification).
 *
 * Wire it up from each app's `proxy.ts` — the `config.matcher` must be a literal
 * in that file, Next.js can't read it through a re-export:
 *
 *   import { clerkProxy } from "@repo/auth/proxy";
 *   export default clerkProxy;
 *   export const config = { matcher: [ ... ] };
 *
 * or, with extra public routes:
 *
 *   import { createClerkProxy } from "@repo/auth/proxy";
 *   export default createClerkProxy(["/", "/privacy"]);
 *   export const config = { matcher: [ ... ] };
 */
export function createClerkProxy(publicPaths: readonly string[] = []) {
  const isAlwaysPublic = (pathname: string) =>
    pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");

  const isExtraPublic = (pathname: string) =>
    publicPaths.some(
      (path) =>
        pathname === path ||
        (path === "/" ? false : pathname.startsWith(`${path}/`)),
    );

  return clerkMiddleware(async (auth, request) => {
    const { userId } = await auth();
    const { pathname } = request.nextUrl;

    if (!userId && !isAlwaysPublic(pathname) && !isExtraPublic(pathname)) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  });
}

/** Default gated proxy — no extra public routes. */
export const clerkProxy = createClerkProxy();
