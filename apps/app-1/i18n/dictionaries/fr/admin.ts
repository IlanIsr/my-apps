import type { AdminTexts } from "@/app/admin/AdminView";

/** French UI strings — shape: {@link AdminTexts}. */
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
  resync: {
    title: "Mettre à jour tous les événements",
    body: "Réécrit l'événement Google de chaque anniversaire selon le format actuel : de la sortie des étoiles la veille jusqu'à la shkia du lendemain. Sans email aux membres, titres inchangés.",
    button: "Mettre à jour tous les événements",
    resume: "Reprendre",
    confirm:
      "Réécrire l'événement de chaque anniversaire dans Google Agenda ? Aucun email n'est envoyé.",
    running: (done: number, total: number) => `Mise à jour… ${done}/${total}`,
    rateLimited: (done: number, total: number) =>
      `Google Agenda limite les écritures — arrêté à ${done}/${total}. Patientez une minute, puis « Reprendre ».`,
    done: (total: number, failed: number) =>
      `Terminé — ${total - failed}/${total} mis à jour` +
      (failed ? `, ${failed} en échec (voir les logs).` : "."),
    error: (message: string) => `Échec : ${message}`,
  },
} as const satisfies AdminTexts;
