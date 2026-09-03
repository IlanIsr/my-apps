import type { ConnectPromptTexts } from "@/app/components/anniversary/ConnectPrompt";

export const connectPrompt = {
  title: "Connecter Google Calendar",
  reconnect:
    "L’accès au calendrier n’a pas été accordé. Déconnectez-vous et reconnectez-vous pour l’accorder.",
  signOut: "Se déconnecter",
} as const satisfies ConnectPromptTexts;
