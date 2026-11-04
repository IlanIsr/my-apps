import type { AppShellTexts } from "@/app/components/AppShell";
import type { ErrorTexts } from "@/app/components/common";
import type { DocSettingsTexts } from "@/app/components/DocSettingsFields";
import type { FileDropTexts } from "@/app/components/FileDrop";
import type { LabelsTexts } from "@/app/components/labels";
import type { ExportTexts } from "@/lib/export-docx";

export const appShell = {
  brand: "Atelier de traduction",
  language: "Langue",
  menu: "Menu",
  nav: {
    documents: "Documents",
    newDocument: "Nouveau",
    glossary: "Glossaire",
    settings: "Réglages",
  },
} as const satisfies AppShellTexts;

export const errors = {
  "not-signed-in": "Votre session a expiré — reconnectez-vous.",
  invalid: "Données invalides.",
  "db-not-configured":
    "La base de données n'est pas configurée (DATABASE_URL).",
  unknown: "Erreur inattendue. Réessayez.",
  "not-found": "Introuvable (supprimé entre-temps ?).",
  "too-many-pages": "Trop de pages pour un seul document (60 au maximum).",
  "ai-not-configured":
    "Claude n'est pas configuré sur ce serveur (clé ANTHROPIC_API_KEY absente ou invalide).",
  "rate-limited":
    "Limite d'utilisation de l'API atteinte. Attendez quelques minutes puis continuez.",
  overloaded:
    "Claude est surchargé en ce moment. Relancez la page dans un instant.",
  refused: "Claude a refusé de traiter cette page.",
  "too-large": "Page trop lourde pour une seule requête.",
  "invalid-reply": "La réponse n'a pas pu être lue. Relancez la page.",
  "ai-failed": "Erreur temporaire de Claude. Relancez la page.",
  "no-scan":
    "Le scan de cette page n'est pas dans ce navigateur (document créé sur un autre appareil).",
} as const satisfies ErrorTexts;

export const labels = {
  target: { fr: "Français", en: "Anglais" },
  doctype: {
    auto: "À déterminer",
    civil: "Acte d'état civil",
    poa: "Procuration",
    judgment: "Jugement, décision",
    contract: "Contrat",
    succession: "Testament, succession",
    diploma: "Diplôme, relevé",
    record: "Casier judiciaire",
    corporate: "Document de société",
    other: "Autre",
  },
  quality: { standard: "Standard", max: "Maximale (plus lente)" },
  origin: {
    "pdf-text": "PDF numérique (texte + image)",
    "pdf-scan": "PDF scanné",
    photo: "Photo",
    docx: "Word (texte extrait)",
  },
  status: {
    idle: "En attente",
    reading: "Lecture",
    read: "Lue",
    translating: "Traduction",
    check: "À vérifier",
    done: "Vérifiée",
    reviewed: "Relue",
    error: "Échec",
  },
  block: {
    title: "Titre",
    paragraph: "Paragraphe",
    table: "Tableau",
    stamp: "Tampon",
    signature: "Signature",
    handwriting: "Manuscrit",
    header: "En-tête",
    footer: "Pied de page",
    other: "Autre",
  },
} as const satisfies LabelsTexts;

export const docSettings = {
  target: "Traduire vers",
  doctype: "Type de document",
  quality: "Qualité",
  qualityHint:
    "Maximale : Claude réfléchit davantage, utile pour les scans difficiles.",
  highRes: "Lecture haute résolution",
  highResHint:
    "Envoie aussi chaque page en deux moitiés pour les petits caractères.",
} as const satisfies DocSettingsTexts;

export const fileDrop = {
  title: "Déposer un PDF, un Word ou des photos",
  hint: "PDF scanné ou numérique, Word (.docx), JPEG, PNG, WebP. Plusieurs fichiers = plusieurs pages, dans l'ordre déposé (réordonnables ensuite). Un ancien .doc doit être enregistré en .docx, une photo HEIC exportée en JPEG.",
  busy: "Préparation des pages…",
} as const satisfies FileDropTexts;

export const exportTexts = {
  unread: "[Page non lue]",
  footer: "Page {page} / {pages}",
  transcriptionHeading: "Transcription · page {page} sur {pages}",
} as const satisfies ExportTexts;
