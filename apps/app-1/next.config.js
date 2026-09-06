import "@repo/env/load";

// Redeploy trigger: 2026-09-04 — rebuild after setting Clerk env vars on the
// App Hosting backend (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is baked in at build).

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Don't let `next dev` write apps/app-1/AGENTS.md + CLAUDE.md — this repo's
  // guidance lives in the root CLAUDE.md.
  agentRules: false,
  // google-auth-library does runtime `require()`s and ships native-ish deps —
  // bundling it breaks the server build. Load it as a real node module instead.
  serverExternalPackages: ["google-auth-library"],
  async redirects() {
    return [
      { source: "/", destination: "/anniversaries", permanent: false },
    ];
  },
};

export default nextConfig;
