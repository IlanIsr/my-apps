// `@repo/env/load` backfills env vars from the monorepo-root `.env` (shared
// defaults, e.g. the Clerk keys) with override:false, so this app's own `.env`
// (its `DATABASE_URL`) still wins. On Vercel the env comes from the project
// settings and no `.env` file exists.
import "@repo/env/load";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Don't let `next dev` write AGENTS.md + CLAUDE.md here — this repo's
  // guidance lives in the root CLAUDE.md.
  agentRules: false,
};

export default nextConfig;
