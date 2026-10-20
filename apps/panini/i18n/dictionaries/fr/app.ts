import type { AppTexts } from "@/app/components/PaniniApp";
import type { ModalTexts } from "@/app/components/Modal";

export const app = {
  eyebrow: "Classeur Panini",
  settings: "Réglages",
  dismiss: "Fermer",
  tabs: {
    collection: "Collection",
    trades: "Échanges",
    reserve: "Réserve",
    pages: "Pages",
    rewards: "Prix",
  },
  errors: {
    "not-signed-in": "Ta session a expiré — reconnecte-toi.",
    "no-album": "Aucun classeur trouvé. Recharge la page.",
    "album-exists": "Tu as déjà un classeur. Recharge la page.",
    "not-found": "Élément introuvable — recharge la page.",
    "too-many-collectors": "Nombre maximum d'enfants atteint.",
    invalid: "Valeur invalide — vérifie les champs.",
    "db-not-configured": "La base de données n'est pas configurée.",
    unknown: "Une erreur est survenue. Réessaie.",
  },
} as const satisfies AppTexts;

export const modal = { close: "Fermer" } as const satisfies ModalTexts;
