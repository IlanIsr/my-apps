import type { NavbarTexts } from "@/app/components/Navbar";

/** English UI strings — shape: {@link NavbarTexts}. */
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
  signIn: "Sign in",
  menu: "Menu",
} as const satisfies NavbarTexts;
