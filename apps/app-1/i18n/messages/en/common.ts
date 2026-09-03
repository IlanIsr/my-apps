import type { Messages } from "../../types";

export const common: Pick<Messages, "appName" | "theme" | "language"> = {
  appName: "Hebrew Anniversaries",
  theme: { toggle: "Toggle theme" },
  language: { label: "Language" },
};
