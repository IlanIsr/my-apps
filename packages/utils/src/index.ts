/**
 * `@repo/utils` — tiny shared helpers, consumed as raw `.ts` (no build step;
 * importers compile it).
 */

/**
 * A greeting stamped with the calling app's name. Placeholder used to prove the
 * shared-package wiring end to end (local dev and deployed).
 *
 * @param appName - Name of the app calling in, e.g. `"app-2"`.
 * @returns `"Hello from shared utils - <appName>"`.
 */
export function getHelloMessage(appName: string): string {
  return `Hello from shared utils - ${appName}`;
}

/** Resolves after `ms` milliseconds. */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Trims, lowercases, drops empties, and de-duplicates a list of strings. */
export function uniqueLowercased(values: readonly string[]): string[] {
  return [...new Set(values.map((v) => v.trim().toLowerCase()).filter(Boolean))];
}

/**
 * Resolves a server action's string error code to display text: a known
 * code maps to its entry in `known`, anything else falls back to `onUnknown`
 * (typically a generic "something went wrong: {message}" formatter).
 */
export function resolveErrorMessage(
  code: string,
  known: Record<string, string>,
  onUnknown: (code: string) => string,
): string {
  return known[code] ?? onUnknown(code);
}
