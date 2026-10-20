import type { ShareLinkViewTexts } from "@/app/anniversaries/share/[id]/ShareLinkView";

/** English UI strings — shape: {@link ShareLinkViewTexts}. */
export const shareLinkView = {
  title: "Join these anniversaries?",
  intro:
    "Pick the ones you'd like to join — you'll be added to each and get a calendar invite.",
  expiredTitle: "This link has expired",
  expiredBody: "Share links only last 24 hours. Ask for a new one.",
  backToList: "Back to my list",
  alreadyJoined: "Already on your list",
  join: "Join selected",
  joining: "Joining…",
  nothingSelected: "Pick at least one anniversary.",
  rateLimited:
    "Google Calendar is busy right now — some invites may be delayed.",
  result: (joined: number, alreadyJoined: number, failed: number) =>
    [
      joined > 0 && `Joined ${joined}`,
      alreadyJoined > 0 && `${alreadyJoined} already on your list`,
      failed > 0 && `${failed} failed`,
    ]
      .filter(Boolean)
      .join(" · ") || "Nothing to do.",
  error: (message: string) => `Something went wrong: ${message}`,
} as const satisfies ShareLinkViewTexts;
