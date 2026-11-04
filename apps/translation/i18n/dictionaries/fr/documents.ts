import type { DocumentsTexts } from "@/app/components/DocumentsView";
import type { NewDocumentTexts } from "@/app/components/NewDocumentView";

export const documents = {
  eyebrow: "Atelier",
  title: "Documents",
  newDocument: "Nouveau document",
  example: "Ouvrir l'exemple",
  exampleTitle: "Exemple — procuration fictive",
  emptyTitle: "Aucun document pour l'instant",
  emptyText:
    "Déposez un document en hébreu : chaque page est lue, transcrite puis traduite par Claude, et les points à vérifier sont signalés à côté de la traduction. L'exemple montre le résultat sans rien envoyer à Claude.",
  pages: "{n} p.",
  progress: "{translated}/{pages} traduites",
  reviewed: "{reviewed}/{pages} relues",
  privacy:
    "Les scans restent dans ce navigateur ; seuls les textes (transcription, traduction, vos corrections) sont enregistrés sur le serveur. Chaque page est envoyée à Claude pour la lecture. Le notaire reste responsable de la traduction certifiée : les signalements orientent la relecture, ils ne la remplacent pas.",
} as const satisfies DocumentsTexts;

export const newDocument = {
  eyebrow: "Nouveau document",
  title: "Déposer un document",
  documentTitle: "Titre du document",
  documentTitlePlaceholder: "Ex. Procuration Israéli — vente Holon",
  pagesHeading: "Pages, dans l'ordre",
  noPages: "Déposez au moins un fichier.",
  ready: "{n} page(s) prête(s).",
  skipped: "Ignoré : {files}.",
  truncated: "Limité à {max} pages.",
  nothingReadable:
    "Aucune page lisible. Formats acceptés : PDF, Word (.docx), JPEG, PNG, WebP.",
  moveUp: "Avancer",
  moveDown: "Reculer",
  rotate: "Pivoter d'un quart de tour",
  remove: "Retirer",
  settings: "Réglages",
  startNow: "Lancer la lecture et la traduction tout de suite",
  startNowHint: "Sinon, vous lancerez le traitement depuis l'atelier.",
  create: "Créer le document",
  creating: "Création…",
  cancel: "Annuler",
  privacy:
    "Les scans sont gardés dans ce navigateur uniquement. Utilisez des documents fictifs ou anonymisés pour les essais.",
} as const satisfies NewDocumentTexts;
