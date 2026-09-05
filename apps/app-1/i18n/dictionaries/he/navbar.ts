import type { NavbarTexts } from "@/app/components/Navbar";

export const navbar = {
  appName: "ימי הולדת עבריים",
  tabs: {
    anniversaries: "ימי הולדת",
    agenda: "סדר יום",
    converter: "המרת תאריכים",
    admin: "ניהול",
  },
  languageLabel: "שפה",
  themeToggle: "החלפת ערכת נושא",
} as const satisfies NavbarTexts;
