import type { ReactNode } from "react";

import { ClerkProvider } from "@clerk/nextjs";

/**
 * Wraps the app in Clerk. All apps share one Clerk instance (same
 * NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY / CLERK_SECRET_KEY), which is what lets a
 * session established on one app carry to the others once they're served from
 * subdomains of a single domain (Clerk shares the session across subdomains
 * automatically; locally it's shared across localhost ports).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  return <ClerkProvider signInUrl="/sign-in">{children}</ClerkProvider>;
}
