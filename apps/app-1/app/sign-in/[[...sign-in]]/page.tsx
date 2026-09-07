/**
 * Catch-all sign-in route. Clerk needs this exact `[[...sign-in]]` path to host
 * its own multi-step flow; the view (and which providers show) lives in
 * `@repo/auth/sign-in`.
 */

import { SignInView } from "@repo/auth/sign-in";

export default function Page() {
  return <SignInView />;
}
