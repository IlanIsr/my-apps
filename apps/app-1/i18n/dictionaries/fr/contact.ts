import type { ContactFormTexts } from "@/app/contact/ContactForm";

export const contact = {
  title: "Contact",
  intro:
    "Un commentaire, un bug, une idée ? Écris-le ici : ça m’arrive directement par mail, et je peux te répondre.",
  kind: "Type",
  kinds: {
    comment: "Commentaire",
    bug: "Bug",
    suggestion: "Suggestion",
  },
  message: "Message",
  placeholder: "Qu’est-ce que tu veux me dire ?",
  send: "Envoyer",
  sending: "Envoi…",
  sent: "Merci ! Ton message a bien été envoyé.",
  sendAnother: "Envoyer un autre message",
  errors: {
    empty: "Écris d’abord un message.",
    "not-signed-in": "Ta session a expiré, reconnecte-toi.",
    invalid: "Ce message ne peut pas être envoyé, vérifie-le et réessaie.",
    "not-configured": "L’envoi n’est pas encore configuré. Réessaie plus tard.",
    failed: "Le message n’a pas pu être envoyé. Réessaie.",
  },
} as const satisfies ContactFormTexts;
