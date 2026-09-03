import { SignIn } from "@clerk/nextjs";

/**
 * Full sign-in view. Which providers show (Google, Apple, …) is controlled in
 * the Clerk dashboard, not here. Render it from a catch-all route:
 *   app/sign-in/[[...sign-in]]/page.tsx
 */
export function SignInView() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6">
      <SignIn />
    </div>
  );
}
