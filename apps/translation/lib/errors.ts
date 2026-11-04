/** Every error code the server can return (client-safe). */
export type ErrorCode =
  | "not-signed-in"
  | "invalid"
  | "db-not-configured"
  | "unknown"
  | "not-found"
  | "too-many-pages"
  | "ai-not-configured"
  | "rate-limited"
  | "overloaded"
  | "refused"
  | "too-large"
  | "invalid-reply"
  | "ai-failed"
  /** Client-only: the page's scan isn't in this browser. */
  | "no-scan";

/** Stop the whole run (not just this page) on these. */
export const FATAL_ERRORS: readonly ErrorCode[] = [
  "not-signed-in",
  "db-not-configured",
  "ai-not-configured",
  "rate-limited",
];
