import type { NavbarTexts } from "@/app/components/Navbar";

/** French UI strings — shape: {@link NavbarTexts}. */
export const navbar = {
  appName: "Anniversaires hébraïques",
  tabs: {
    anniversaries: "Anniversaires",
    agenda: "Agenda",
    converter: "Convertisseur",
    about: "À propos",
    admin: "Admin",
  },
  languageLabel: "Langue",
  themeToggle: "Changer de thème",
  signIn: "Se connecter",
  menu: "Menu",
} as const satisfies NavbarTexts;
