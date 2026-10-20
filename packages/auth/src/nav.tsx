"use client";

import type { ReactNode } from "react";

import { Show, UserButton } from "@clerk/nextjs";

/**
 * Account control for an app's header: the Clerk user menu once signed in,
 * and `signedOut` (e.g. a "Sign in" link) otherwise — nothing if omitted.
 */
export function AuthControl({ signedOut }: { signedOut?: ReactNode }) {
  return (
    <>
      <Show when="signed-in">
        <UserButton />
      </Show>
      {signedOut && <Show when="signed-out">{signedOut}</Show>}
    </>
  );
}
