import "@repo/env/load";

// Redeploy trigger: 2026-09-04 — rebuild after setting Clerk env vars on the
// App Hosting backend (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is baked in at build).

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Don't let `next dev` write apps/app-1/AGENTS.md + CLAUDE.md — this repo's
  // guidance lives in the root CLAUDE.md.
  agentRules: false,
  // firebase-admin / google-auth-library do runtime `require()`s and ship their
  // own native-ish deps — bundling them breaks the server build on App Hosting
  // (Cloud Run). Load them as real node modules instead.
  serverExternalPackages: [
    "firebase-admin",
    "@google-cloud/firestore",
    "google-auth-library",
    "google-gax",
    "gcp-metadata",
  ],
  async redirects() {
    return [
      { source: "/", destination: "/anniversaries", permanent: false },
    ];
  },
};

export default nextConfig;
