import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

/**
 * `DATABASE_URL` lives in the monorepo-root `.env` / `.env.local` (same place the
 * apps read it from). Load those here so `drizzle-kit` — run from this package
 * dir — sees it. `db:generate` works offline; the rest need a real URL.
 */
for (const rel of [
  "../../.env",
  "../../.env.local",
  "../../apps/app-1/.env.local",
]) {
  const path = resolve(process.cwd(), rel);
  if (existsSync(path)) config({ path, override: true });
}

const url = process.env.DATABASE_URL;
if (!url && !process.argv.includes("generate")) {
  console.warn(
    "[drizzle] DATABASE_URL is not set — connecting commands will fail. " +
      "Add it to the repo-root .env / .env.local.",
  );
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: url ?? "postgres://user:pass@localhost:5432/placeholder",
  },
  strict: true,
  verbose: true,
});
