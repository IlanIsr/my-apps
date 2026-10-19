import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

/**
 * `DATABASE_URL` is this app's own (Neon project `panini`), so it lives in
 * `apps/panini/.env` — never in the shared root `.env`, which would leak it to
 * the other apps. On Vercel it comes from the project env vars instead.
 * `db:generate` works offline; the rest need a real URL.
 */
for (const rel of [".env", ".env.local"]) {
  const path = resolve(process.cwd(), rel);
  if (existsSync(path)) config({ path, override: true, quiet: true });
}

const url = process.env.DATABASE_URL;
if (!url && !process.argv.includes("generate")) {
  console.warn(
    "[drizzle] DATABASE_URL is not set — connecting commands will fail. " +
      "Add it to apps/panini/.env.",
  );
}

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: url ?? "postgres://user:pass@localhost:5432/placeholder",
  },
  strict: true,
  verbose: true,
});
