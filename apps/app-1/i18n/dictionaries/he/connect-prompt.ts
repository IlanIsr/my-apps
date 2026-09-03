import type { ConnectPromptTexts } from "@/app/components/anniversary/ConnectPrompt";

export const connectPrompt = {
  title: "חיבור יומן Google",
  reconnect: "גישה ליומן לא אושרה. התנתקו והתחברו מחדש כדי לאשר.",
  signOut: "התנתקות",
} as const satisfies ConnectPromptTexts;
