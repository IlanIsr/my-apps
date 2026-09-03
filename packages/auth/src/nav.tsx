"use client";

import { Show, UserButton } from "@clerk/nextjs";

/** Account control for an app's header. Only renders once signed in. */
export function AuthControl() {
  return (
    <Show when="signed-in">
      <UserButton />
    </Show>
  );
}
