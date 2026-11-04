import type { AppShellTexts } from "@/app/components/AppShell";
import type { ErrorTexts } from "@/app/components/common";
import type { DocSettingsTexts } from "@/app/components/DocSettingsFields";
import type { FileDropTexts } from "@/app/components/FileDrop";
import type { LabelsTexts } from "@/app/components/labels";
import type { ExportTexts } from "@/lib/export-docx";

export const appShell = {
  brand: "Translation workbench",
  language: "Language",
  menu: "Menu",
  nav: {
    documents: "Documents",
    newDocument: "New",
    glossary: "Glossary",
    settings: "Settings",
  },
} as const satisfies AppShellTexts;

export const errors = {
  "not-signed-in": "Your session expired — please sign in again.",
  invalid: "Invalid data.",
  "db-not-configured": "The database is not configured (DATABASE_URL).",
  unknown: "Unexpected error. Please try again.",
  "not-found": "Not found (deleted in the meantime?).",
  "too-many-pages": "Too many pages for one document (60 at most).",
  "ai-not-configured":
    "Claude is not configured on this server (ANTHROPIC_API_KEY missing or invalid).",
  "rate-limited": "API usage limit reached. Wait a few minutes, then continue.",
  overloaded: "Claude is overloaded right now. Run the page again in a moment.",
  refused: "Claude declined to process this page.",
  "too-large": "Page too heavy for a single request.",
  "invalid-reply": "The reply could not be read. Run the page again.",
  "ai-failed": "Temporary Claude error. Run the page again.",
  "no-scan":
    "This page's scan isn't in this browser (the document was created on another device).",
} as const satisfies ErrorTexts;

export const labels = {
  target: { fr: "French", en: "English" },
  doctype: {
    auto: "Detect",
    civil: "Civil-status record",
    poa: "Power of attorney",
    judgment: "Judgment, decision",
    contract: "Contract",
    succession: "Will, succession",
    diploma: "Diploma, transcript",
    record: "Police record",
    corporate: "Company document",
    other: "Other",
  },
  quality: { standard: "Standard", max: "Maximum (slower)" },
  origin: {
    "pdf-text": "Digital PDF (text + image)",
    "pdf-scan": "Scanned PDF",
    photo: "Photo",
    docx: "Word (extracted text)",
  },
  status: {
    idle: "Waiting",
    reading: "Reading",
    read: "Read",
    translating: "Translating",
    check: "To check",
    done: "Checked",
    reviewed: "Proofread",
    error: "Failed",
  },
  block: {
    title: "Title",
    paragraph: "Paragraph",
    table: "Table",
    stamp: "Stamp",
    signature: "Signature",
    handwriting: "Handwriting",
    header: "Header",
    footer: "Footer",
    other: "Other",
  },
} as const satisfies LabelsTexts;

export const docSettings = {
  target: "Translate into",
  doctype: "Document type",
  quality: "Quality",
  qualityHint: "Maximum: Claude thinks harder — useful for difficult scans.",
  highRes: "High-resolution reading",
  highResHint: "Also sends each page as two halves, for small print.",
} as const satisfies DocSettingsTexts;

export const fileDrop = {
  title: "Drop a PDF, a Word file or photos",
  hint: "Scanned or digital PDF, Word (.docx), JPEG, PNG, WebP. Several files = several pages, in the order dropped (you can reorder them). Save an old .doc as .docx, export a HEIC photo as JPEG.",
  busy: "Preparing the pages…",
} as const satisfies FileDropTexts;

export const exportTexts = {
  unread: "[Page not read]",
  footer: "Page {page} / {pages}",
  transcriptionHeading: "Transcription · page {page} of {pages}",
} as const satisfies ExportTexts;
