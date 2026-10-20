import type { ContactFormTexts } from "@/app/contact/ContactForm";

export const contact = {
  title: "Contact",
  intro:
    "A comment, a bug, an idea? Write it here — it goes straight to me by email, and I can reply to your address.",
  kind: "Type",
  kinds: {
    comment: "Comment",
    bug: "Bug",
    suggestion: "Suggestion",
  },
  message: "Message",
  placeholder: "What would you like to tell me?",
  send: "Send",
  sending: "Sending…",
  sent: "Thanks! Your message has been sent.",
  sendAnother: "Send another",
  errors: {
    empty: "Write a message first.",
    "not-signed-in": "Your session expired — sign in again.",
    invalid: "That message can’t be sent — check it and try again.",
    "not-configured": "Sending isn’t set up yet. Please try again later.",
    failed: "The message couldn’t be sent. Please try again.",
  },
} as const satisfies ContactFormTexts;
