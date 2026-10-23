import type { CreateShareLinkModalTexts } from "@/app/components/anniversary/CreateShareLinkModal";

/**
 * English UI strings — shape: {@link CreateShareLinkModalTexts}. Shared by
 * `anniversaries.ts` ("Share my list") and `anniversary-detail.ts` ("Share
 * this one") — same modal, two call sites.
 */
export const createShareLinkModal = {
  title: "Share a link",
  intro:
    "Pick which anniversaries to include. Whoever opens the link decides which ones to join — you're never asked for anyone's email.",
  selectAll: "Select all",
  clearAll: "Clear",
  generate: "Generate link",
  generating: "Generating…",
  cancel: "Cancel",
  copy: "Copy",
  copied: "Copied!",
  linkIntro: "Share this link with whoever you like:",
  expiresIn: "Expires in 24 hours. Anyone can open it and join until then.",
  nothingSelected: "Pick at least one anniversary.",
  search: "Search…",
  noResults: "No match.",
  error: (message: string) => `Something went wrong: ${message}`,
} as const satisfies CreateShareLinkModalTexts;
