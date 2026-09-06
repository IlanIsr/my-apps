/**
 * Neon / Postgres connection for the anniversaries store. Server-only.
 *
 * Uses the `neon-http` driver — one round-trip per query, no pooled sockets, so
 * it is safe on serverless / edge. Multi-table writes go through `db.batch(...)`
 * (see `store.ts`), which Neon runs as a single transaction.
 */

import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";

import * as schema from "./schema";

export type Db = NeonHttpDatabase<typeof schema>;

/** Thrown when `DATABASE_URL` is not set. Surfaced to the app as a config error. */
export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super("database-not-configured");
    this.name = "DatabaseNotConfiguredError";
  }
}

function requireUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error(
      "[anniversaries] DATABASE_URL is not set — the Postgres store is unavailable.",
    );
    throw new DatabaseNotConfiguredError();
  }
  return url;
}

let cached: Db | null = null;

/** The store's own database (from `DATABASE_URL`). */
export function db(): Db {
  if (!cached) cached = drizzle(neon(requireUrl()), { schema });
  return cached;
}

/** A database for an arbitrary connection string (used by the prod → pre-prod sync). */
export function dbFor(connectionString: string): Db {
  return drizzle(neon(connectionString), { schema });
}
