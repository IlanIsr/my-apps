/**
 * `@repo/utils` — tiny shared helpers, consumed as raw `.ts` (no build step;
 * importers compile it). Currently just a placeholder used by app-2's stub page.
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
