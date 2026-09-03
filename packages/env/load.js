import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { config } from "dotenv";

/**
 * Backfill env vars from the monorepo-root `.env` (shared defaults, e.g. the
 * Clerk keys). Import this at the top of each app's `next.config.js`:
 *
 *   import "@repo/env/load";
 *
 * By the time `next.config.js` runs, Next has already loaded the app's own
 * `.env*` files into `process.env`. `override: false` means those app-local
 * values win — the root `.env` only fills in what an app hasn't set.
 *
 * Apps live at `<root>/apps/<name>` and Next runs with cwd = the app dir.
 */
const rootEnv = resolve(process.cwd(), "../../.env");

if (existsSync(rootEnv)) {
  config({ path: rootEnv, override: false });
}
