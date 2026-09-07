// `@repo/env/load` backfills env vars from the monorepo-root `.env` (shared
// defaults) with override:false, so an app-local `.env.local` still wins.
import "@repo/env/load";

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
