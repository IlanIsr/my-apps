import type { FooterTexts } from "@/app/components/Footer";

/** English UI strings — shape: {@link FooterTexts}. */
export const footer = {
  privacyLink: "Privacy policy",
  contactLink: "Contact",
} as const satisfies FooterTexts;
