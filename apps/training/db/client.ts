/**
 * Neon / Postgres connection for the Training store. Server-only.
 *
 * `neon-http` driver: one round-trip per query, no pooled sockets — safe on
 * serverless. Multi-statement writes go through `db().batch(...)`, which Neon
 * runs as a single transaction.
 */

import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";

import * as schema from "./schema";

export type Db = NeonHttpDatabase<typeof schema>;

/** Thrown when `DATABASE_URL` is not set. */
export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super("db-not-configured");
    this.name = "DatabaseNotConfiguredError";
  }
}

let cached: Db | null = null;

export function db(): Db {
  if (!cached) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      console.error("[training] DATABASE_URL is not set.");
      throw new DatabaseNotConfiguredError();
    }
    cached = drizzle(neon(url), { schema });
  }
  return cached;
}
