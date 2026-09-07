// `@repo/env/load` backfills env vars from the monorepo-root `.env` (shared
// defaults) with override:false, so an app-local `.env.local` still wins. On
// Vercel the env comes from the project settings and no `.env` file exists.
import "@repo/env/load";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Don't let `next dev` write apps/app-1/AGENTS.md + CLAUDE.md — this repo's
  // guidance lives in the root CLAUDE.md.
  agentRules: false,
  // google-auth-library does runtime `require()`s and ships native-ish deps —
  // bundling it breaks the server build. Load it as a real node module instead.
  serverExternalPackages: ["google-auth-library"],
  async redirects() {
    return [{ source: "/", destination: "/anniversaries", permanent: false }];
  },
};

export default nextConfig;
