import type { NavbarTexts } from "@/app/components/Navbar";

/** French UI strings — shape: {@link NavbarTexts}. */
export const navbar = {
  appName: "Anniversaires hébraïques",
  tabs: {
    anniversaries: "Anniversaires",
    agenda: "Agenda",
    converter: "Convertisseur",
    admin: "Admin",
  },
  languageLabel: "Langue",
  themeToggle: "Changer de thème",
} as const satisfies NavbarTexts;
