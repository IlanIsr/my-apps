import type { Messages } from "../../types";

export const common: Pick<Messages, "appName" | "theme" | "language"> = {
  appName: "Anniversaires hébraïques",
  theme: { toggle: "Changer de thème" },
  language: { label: "Langue" },
};
