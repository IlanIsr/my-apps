import "@repo/env/load";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Don't let `next dev` write apps/app-1/AGENTS.md + CLAUDE.md — this repo's
  // guidance lives in the root CLAUDE.md.
  agentRules: false,
  async redirects() {
    return [
      { source: "/", destination: "/anniversaries", permanent: false },
    ];
  },
};

export default nextConfig;
