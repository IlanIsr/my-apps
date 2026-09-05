import type { AdminTexts } from "@/app/admin/AdminView";

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
} as const satisfies AdminTexts;
