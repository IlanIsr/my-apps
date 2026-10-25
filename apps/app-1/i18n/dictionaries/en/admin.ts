import type { AdminTexts } from "@/app/admin/AdminView";

/** English UI strings — shape: {@link AdminTexts}. */
export const admin = {
  eyebrow: "Shared account",
  title: "Admin",
  subtitle: "Settings for the shared family calendar.",
  empty: "Nothing here yet.",
  sync: {
    title: "Copy production data",
    body: "Replace every anniversary in this environment with an exact copy of production's. Calendar events aren't touched.",
    button: "Copy from production",
    running: "Copying…",
    confirm:
      "This replaces all anniversaries in this environment with production's. Continue?",
    done: (written: number, deleted: number) =>
      `Done — ${written} copied, ${deleted} removed.`,
    error: (message: string) => `Sync failed: ${message}`,
  },
  resync: {
    title: "Update every event",
    body: "Rewrites each anniversary's Google event in the current format: from nightfall on the eve to the next day's sunset (shkia). No emails to members, titles unchanged.",
    button: "Update every event",
    resume: "Resume",
    confirm:
      "Rewrite every anniversary's event in Google Calendar? No email is sent.",
    running: (done: number, total: number) => `Updating… ${done}/${total}`,
    rateLimited: (done: number, total: number) =>
      `Google Calendar is throttling writes — stopped at ${done}/${total}. Wait a minute, then “Resume”.`,
    done: (total: number, failed: number) =>
      `Done — ${total - failed}/${total} updated` +
      (failed ? `, ${failed} failed (see the logs).` : "."),
    error: (message: string) => `Failed: ${message}`,
  },
} as const satisfies AdminTexts;
