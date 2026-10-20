import type { FooterTexts } from "@/app/components/Footer";

/** French UI strings — shape: {@link FooterTexts}. */
export const footer = {
  privacyLink: "Politique de confidentialité",
  contactLink: "Contact",
} as const satisfies FooterTexts;
