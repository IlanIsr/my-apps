import type { Messages } from "../../types";

export const common: Pick<Messages, "appName" | "theme" | "language"> = {
  appName: "Hebrew Date Converter",
  theme: { toggle: "Toggle theme" },
  language: { label: "Language" },
};
