import type { DocumentsTexts } from "@/app/components/DocumentsView";
import type { NewDocumentTexts } from "@/app/components/NewDocumentView";

export const documents = {
  eyebrow: "Workbench",
  title: "Documents",
  newDocument: "New document",
  example: "Open the example",
  exampleTitle: "Example — fictional power of attorney",
  emptyTitle: "No documents yet",
  emptyText:
    "Drop a Hebrew document: Claude reads, transcribes and translates each page, and the points to check are flagged next to the translation. The example shows the result without sending anything to Claude.",
  pages: "{n} p.",
  progress: "{translated}/{pages} translated",
  reviewed: "{reviewed}/{pages} proofread",
  privacy:
    "Scans stay in this browser; only the texts (transcription, translation, your edits) are saved on the server. Each page is sent to Claude to be read. The notary remains responsible for the certified translation: the flags guide the review, they don't replace it.",
} as const satisfies DocumentsTexts;

export const newDocument = {
  eyebrow: "New document",
  title: "Drop a document",
  documentTitle: "Document title",
  documentTitlePlaceholder: "E.g. Israeli power of attorney — Holon sale",
  pagesHeading: "Pages, in order",
  noPages: "Drop at least one file.",
  ready: "{n} page(s) ready.",
  skipped: "Skipped: {files}.",
  truncated: "Limited to {max} pages.",
  nothingReadable:
    "No readable page. Accepted formats: PDF, Word (.docx), JPEG, PNG, WebP.",
  moveUp: "Move earlier",
  moveDown: "Move later",
  rotate: "Rotate a quarter turn",
  remove: "Remove",
  settings: "Settings",
  startNow: "Start reading and translating right away",
  startNowHint: "Otherwise, start the processing from the workbench.",
  create: "Create the document",
  creating: "Creating…",
  cancel: "Cancel",
  privacy:
    "Scans are kept in this browser only. Use fictional or anonymised documents for trials.",
} as const satisfies NewDocumentTexts;
