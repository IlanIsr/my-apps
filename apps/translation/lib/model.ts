/**
 * Client-safe types + constants for the translation workbench. No DB, no
 * server-only imports — the server (`lib/store.ts`, the API routes) and the
 * client views both use this.
 *
 * A **document** is a set of **pages** in order. Each page is first
 * transcribed (Hebrew text, in typed blocks) and then translated into the
 * document's target language. The scans themselves never reach the database:
 * they stay in the browser (IndexedDB, `lib/scan-store.ts`) and are only sent
 * to Claude for the transcription.
 */

export const TARGET_LANGS = ["fr", "en"] as const;
export type TargetLang = (typeof TARGET_LANGS)[number];

export const QUALITIES = ["standard", "max"] as const;
export type Quality = (typeof QUALITIES)[number];

/** The language Claude writes its review notes in (= the UI language). */
export const NOTE_LANGS = ["fr", "en", "he"] as const;
export type NoteLang = (typeof NOTE_LANGS)[number];

export const DOCTYPES = [
  "auto",
  "civil",
  "poa",
  "judgment",
  "contract",
  "succession",
  "diploma",
  "record",
  "corporate",
  "other",
] as const;
export type Doctype = (typeof DOCTYPES)[number];

/** How a page got into the document. */
export const PAGE_ORIGINS = ["pdf-text", "pdf-scan", "photo", "docx"] as const;
export type PageOrigin = (typeof PAGE_ORIGINS)[number];

export const BLOCK_TYPES = [
  "title",
  "paragraph",
  "table",
  "stamp",
  "signature",
  "handwriting",
  "header",
  "footer",
  "other",
] as const;
export type BlockType = (typeof BLOCK_TYPES)[number];

export type Block = { type: BlockType; text: string };

export type Transcription = {
  blocks: Block[];
  /** The page begins mid-sentence (continued from the previous page). */
  startsMid: boolean;
  /** The last sentence continues on the next page. */
  endsMid: boolean;
  /** Reading problems (blur, cut edge…), in the UI language, or `""`. */
  notes: string;
};

export type Term = { source: string; rendering: string; note: string };

export type Translation = {
  text: string;
  /** Terms the reviewer should check (Claude's own list). */
  terms: Term[];
  /** Passages whose meaning is uncertain. */
  doubts: string[];
  lang: TargetLang;
};

/** What the reviewer did about one flag (by flag key). */
export type Resolution = {
  label: string;
  /** Translation before / after an edit; both `null` = "kept as is". */
  before: string | null;
  after: string | null;
};

export type Page = {
  id: string;
  documentId: string;
  position: number;
  origin: PageOrigin;
  /** File name (+ page / section number). */
  source: string;
  /** The PDF had a usable text layer (sent to Claude as a reference). */
  hasPdfText: boolean;
  /** Why a PDF's text layer was discarded, or `null`. */
  textNote: string | null;
  width: number;
  height: number;
  /** A scan exists (in the browser that created the document). */
  hasImage: boolean;
  transcription: Transcription | null;
  translation: Translation | null;
  resolved: Record<string, Resolution>;
  /** The reviewer marked the page as proofread. */
  reviewed: boolean;
  /** Last processing failure (error code), or `null`. */
  error: string | null;
  updatedAt: string;
};

export type DocumentInfo = {
  id: string;
  title: string;
  target: TargetLang;
  doctype: Doctype;
  quality: Quality;
  /** Also send each tall page as two overlapping halves. */
  highRes: boolean;
  createdAt: string;
  updatedAt: string;
};

export type DocumentSummary = DocumentInfo & {
  pages: number;
  transcribed: number;
  translated: number;
  reviewed: number;
};

export type FullDocument = { document: DocumentInfo; pages: Page[] };

export type GlossaryEntry = {
  id: string;
  lang: TargetLang;
  source: string;
  rendering: string;
};

export type Settings = {
  /** Printed under the certification in exports. */
  translatorName: string;
  /** Certification statement per target language; `{date}` and `{pages}`
   * are filled in at export time. Empty = no certification block. */
  certification: Record<TargetLang, string>;
  defaultTarget: TargetLang;
  defaultDoctype: Doctype;
  defaultQuality: Quality;
  defaultHighRes: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  translatorName: "",
  certification: { fr: "", en: "" },
  defaultTarget: "fr",
  defaultDoctype: "auto",
  defaultQuality: "standard",
  defaultHighRes: true,
};

/** What the new-document form sends for each page. */
export type PageInput = {
  origin: PageOrigin;
  source: string;
  pdfText: string | null;
  textNote: string | null;
  width: number;
  height: number;
  hasImage: boolean;
  /** Pre-filled for Word files (text extracted directly). */
  transcription: Transcription | null;
  /** Only for the built-in example. */
  translation: Translation | null;
};

export type DocumentInput = {
  title: string;
  target: TargetLang;
  doctype: Doctype;
  quality: Quality;
  highRes: boolean;
  pages: PageInput[];
};

export type DocumentPatch = Partial<
  Pick<DocumentInfo, "title" | "target" | "doctype" | "quality" | "highRes">
>;

export const LIMITS = {
  title: 200,
  pages: 60,
  source: 300,
  pdfText: 20000,
  blockText: 8000,
  blocks: 200,
  translation: 60000,
  glossaryEntries: 2000,
  glossaryText: 300,
  certification: 3000,
  instruction: 4000,
  /** Bytes of images sent for one page's transcription. */
  uploadBytes: 4_000_000,
};

/** The Hebrew text of the page's body (no running header / footer). */
export function bodyText(t: Transcription): string {
  return t.blocks
    .filter((b) => b.type !== "header" && b.type !== "footer")
    .map((b) => b.text)
    .join("\n\n");
}

/** The whole transcription as one editable text (blocks separated by a
 * blank line). */
export function transcriptionText(t: Transcription): string {
  return t.blocks.map((b) => b.text).join("\n\n");
}

/** Edited text → blocks, keeping each block's type by position. */
export function blocksFromText(text: string, previous: Block[]): Block[] {
  return text
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((t, i) => ({ type: previous[i]?.type ?? "paragraph", text: t }));
}
