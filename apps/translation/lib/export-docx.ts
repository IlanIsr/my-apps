/**
 * Word exports, built in the browser (`docx`): the translation (one section
 * per page, page numbers in the footer, the translator's certification at the
 * end) and the Hebrew transcription (right-to-left). Both are laid out like
 * the original, block by block (`lib/layout.ts`): header and footer small and
 * centred, title centred in bold, tables as tables, stamps framed, signatures
 * at the end of the line.
 */

import { looksLikeTable, tableRows, translationBlocks } from "./layout";
import type { Block, Page, Settings, TargetLang } from "./model";

/** Texts of the transcription export, in the UI language. */
export type ExportTexts = {
  unread: string;
  /** Footer: `{page}` / `{pages}` are replaced by Word fields. */
  footer: string;
  /** Small grey line above each page: `{page}`, `{pages}`. */
  transcriptionHeading: string;
};

/** The translation export is written in its target language, whatever the
 * UI language. */
export const TRANSLATION_TEXTS: Record<
  TargetLang,
  { pageHeading: string; untranslated: string; footer: string }
> = {
  fr: {
    pageHeading:
      "Traduction de l'hébreu vers le français · page {page} sur {pages}",
    untranslated: "[Page non traduite]",
    footer: "Page {page} / {pages}",
  },
  en: {
    pageHeading:
      "Translation from Hebrew into English · page {page} of {pages}",
    untranslated: "[Page not translated]",
    footer: "Page {page} / {pages}",
  },
};

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (m, k: string) =>
    k in values ? String(values[k]) : m,
  );

export function safeFilename(title: string): string {
  return (
    title
      .normalize("NFKD")
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "document"
  );
}

const today = () => new Date().toISOString().slice(0, 10);

/** Today's date, written for the certification. */
function longDate(lang: TargetLang): string {
  return new Date().toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

async function footer(d: typeof import("docx"), template: string) {
  const [before, rest = ""] = template.split("{page}");
  const [middle, after = ""] = rest.split("{pages}");
  return new d.Footer({
    children: [
      new d.Paragraph({
        alignment: d.AlignmentType.CENTER,
        children: [
          new d.TextRun({ text: before ?? "", size: 16, color: "777777" }),
          new d.TextRun({
            children: [d.PageNumber.CURRENT],
            size: 16,
            color: "777777",
          }),
          new d.TextRun({ text: middle ?? "", size: 16, color: "777777" }),
          new d.TextRun({
            children: [d.PageNumber.TOTAL_PAGES],
            size: 16,
            color: "777777",
          }),
          new d.TextRun({ text: after, size: 16, color: "777777" }),
        ],
      }),
    ],
  });
}

type Docx = typeof import("docx");
type Node = InstanceType<Docx["Paragraph"]> | InstanceType<Docx["Table"]>;

function runs(d: Docx, text: string, rtl: boolean, style: object = {}) {
  return text.split("\n").map(
    (line, j) =>
      new d.TextRun({
        text: line,
        break: j ? 1 : 0,
        ...(rtl ? { rightToLeft: true, font: "David" } : {}),
        ...style,
      }),
  );
}

/** One block of the page, styled by its type like the original. */
function blockNodes(d: Docx, block: Block, rtl: boolean): Node[] {
  const start = rtl ? d.AlignmentType.RIGHT : d.AlignmentType.LEFT;
  const end = rtl ? d.AlignmentType.LEFT : d.AlignmentType.RIGHT;
  const para = (options: object, style: object = {}) =>
    new d.Paragraph({
      bidirectional: rtl,
      spacing: { after: 180 },
      alignment: start,
      children: runs(d, block.text, rtl, style),
      ...options,
    });

  if (block.type === "table" || looksLikeTable(block.text)) {
    const rows = tableRows(block.text);
    const width = Math.max(...rows.map((r) => r.length));
    return [
      new d.Table({
        width: { size: 100, type: d.WidthType.PERCENTAGE },
        visuallyRightToLeft: rtl,
        rows: rows.map(
          (row) =>
            new d.TableRow({
              children: Array.from(
                { length: width },
                (_, c) =>
                  new d.TableCell({
                    children: [
                      new d.Paragraph({
                        bidirectional: rtl,
                        alignment: start,
                        children: runs(d, row[c] ?? "", rtl, { size: 21 }),
                      }),
                    ],
                  }),
              ),
            }),
        ),
      }),
      new d.Paragraph({ spacing: { after: 120 }, children: [] }),
    ];
  }

  const border = { style: d.BorderStyle.DOUBLE, size: 6, color: "777777" };
  switch (block.type) {
    case "header":
    case "footer":
      return [
        para(
          { alignment: d.AlignmentType.CENTER },
          { size: 18, color: "555555" },
        ),
      ];
    case "title":
      return [
        para(
          { alignment: d.AlignmentType.CENTER, spacing: { after: 300 } },
          { bold: true, size: 28 },
        ),
      ];
    case "stamp":
      return [
        para(
          {
            alignment: end,
            border: { top: border, bottom: border, left: border, right: border },
          },
          { italics: true },
        ),
      ];
    case "signature":
      return [para({ alignment: end }, { italics: true })];
    case "handwriting":
      return [para({}, { italics: true })];
    default:
      return [para({ alignment: d.AlignmentType.JUSTIFIED })];
  }
}

export async function exportTranslation(input: {
  title: string;
  target: TargetLang;
  pages: Page[];
  settings: Settings;
}) {
  const d = await import("docx");
  const t = TRANSLATION_TEXTS[input.target];
  const N = input.pages.length;
  const children: Node[] = [];
  input.pages.forEach((p, i) => {
    children.push(
      new d.Paragraph({
        pageBreakBefore: i > 0,
        spacing: { after: 240 },
        children: [
          new d.TextRun({
            text: fill(t.pageHeading, { page: i + 1, pages: N }),
            size: 18,
            color: "666666",
          }),
        ],
      }),
    );
    const blocks: Block[] = p.translation
      ? translationBlocks(p)
      : [{ type: "paragraph", text: t.untranslated }];
    for (const b of blocks) children.push(...blockNodes(d, b, false));
  });

  const cert = input.settings.certification[input.target].trim();
  if (cert) {
    children.push(
      new d.Paragraph({ spacing: { before: 600 }, children: [] }),
      ...fill(cert, { date: longDate(input.target), pages: N })
        .split(/\n/)
        .map(
          (line) =>
            new d.Paragraph({
              spacing: { after: 120 },
              children: [new d.TextRun({ text: line })],
            }),
        ),
    );
    if (input.settings.translatorName.trim()) {
      children.push(
        new d.Paragraph({
          spacing: { before: 480 },
          alignment: d.AlignmentType.RIGHT,
          children: [
            new d.TextRun({
              text: input.settings.translatorName.trim(),
              bold: true,
            }),
          ],
        }),
      );
    }
  }

  const doc = new d.Document({
    title: input.title,
    styles: {
      default: { document: { run: { font: "Times New Roman", size: 24 } } },
    },
    sections: [{ footers: { default: await footer(d, t.footer) }, children }],
  });
  download(
    await d.Packer.toBlob(doc),
    `${safeFilename(input.title)}-${input.target}-${today()}.docx`,
  );
}

export async function exportTranscription(input: {
  title: string;
  pages: Page[];
  t: ExportTexts;
}) {
  const d = await import("docx");
  const N = input.pages.length;
  const children: Node[] = [];
  input.pages.forEach((p, i) => {
    children.push(
      new d.Paragraph({
        pageBreakBefore: i > 0,
        spacing: { after: 240 },
        children: [
          new d.TextRun({
            text: fill(input.t.transcriptionHeading, { page: i + 1, pages: N }),
            size: 18,
            color: "666666",
          }),
        ],
      }),
    );
    const blocks: Block[] = p.transcription?.blocks ?? [
      { type: "paragraph", text: input.t.unread },
    ];
    for (const b of blocks) children.push(...blockNodes(d, b, true));
  });
  const doc = new d.Document({
    title: input.title,
    styles: { default: { document: { run: { font: "David", size: 24 } } } },
    sections: [
      { footers: { default: await footer(d, input.t.footer) }, children },
    ],
  });
  download(
    await d.Packer.toBlob(doc),
    `${safeFilename(input.title)}-he-${today()}.docx`,
  );
}
