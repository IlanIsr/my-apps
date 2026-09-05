import type { AdminTexts } from "@/app/admin/AdminView";

export const admin = {
  eyebrow: "Compte partagé",
  title: "Admin",
  subtitle: "Réglages du calendrier familial partagé.",
  empty: "Rien ici pour l’instant.",
  sync: {
    title: "Copier les données de production",
    body: "Remplace tous les anniversaires de cet environnement par une copie exacte de la production. Les événements du calendrier ne sont pas touchés.",
    button: "Copier depuis la production",
    running: "Copie…",
    confirm:
      "Ceci remplace tous les anniversaires de cet environnement par ceux de la production. Continuer ?",
    done: (written: number, deleted: number) =>
      `Terminé — ${written} copiés, ${deleted} supprimés.`,
    error: (message: string) => `Échec de la synchro : ${message}`,
  },
} as const satisfies AdminTexts;
