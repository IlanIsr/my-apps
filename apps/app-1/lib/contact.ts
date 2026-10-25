export const CONTACT_EMAIL = "anniversaries.calendar@gmail.com";

/** What a `/contact` message is about. */
export const CONTACT_KINDS = ["comment", "bug", "suggestion"] as const;
export type ContactKind = (typeof CONTACT_KINDS)[number];

/** Longest `/contact` message accepted. */
export const MESSAGE_MAX = 5000;
