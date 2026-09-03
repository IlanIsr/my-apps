import type { ConnectPromptTexts } from "@/app/components/anniversary/ConnectPrompt";

export const connectPrompt = {
  title: "Connect Google Calendar",
  reconnect:
    "Calendar access wasn’t granted. Sign out and back in to grant it.",
  signOut: "Sign out",
} as const satisfies ConnectPromptTexts;
