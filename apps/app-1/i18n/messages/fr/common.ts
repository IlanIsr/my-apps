import type { Messages } from "../../types";

export const common: Pick<Messages, "appName" | "theme" | "language"> = {
  appName: "Convertisseur de dates hébraïques",
  theme: { toggle: "Changer de thème" },
  language: { label: "Langue" },
};
