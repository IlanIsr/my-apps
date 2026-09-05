import type { NavbarTexts } from "@/app/components/Navbar";

export const navbar = {
  appName: "Hebrew Anniversaries",
  tabs: {
    anniversaries: "Anniversaries",
    agenda: "Agenda",
    converter: "Converter",
    admin: "Admin",
  },
  languageLabel: "Language",
  themeToggle: "Toggle theme",
} as const satisfies NavbarTexts;
