import { clerkProxy } from "@repo/auth/proxy";

export default clerkProxy;

export const config = {
  matcher: [
    // Excludes static-asset extensions and Next's generated metadata-route
    // icons (`/icon`, `/apple-icon`, …) — those are extensionless, so a
    // signed-out request must still get the image, not a sign-in redirect.
    "/((?!_next|(?:apple-icon|icon|opengraph-image|twitter-image)(?:$|\\?)|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
