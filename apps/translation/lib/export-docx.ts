/**
 * Word exports, built in the browser (`docx`): the translation (one section
 * per page, page numbers in the footer, the translator's certification at the
 * end) and the Hebrew transcription (right-to-left).
 */

import type { Page, Settings, TargetLang } from "./model";

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

export async function exportTranslation(input: {
  title: string;
  target: TargetLang;
  pages: Page[];
  settings: Settings;
}) {
  const d = await import("docx");
  const t = TRANSLATION_TEXTS[input.target];
  const N = input.pages.length;
  const children: InstanceType<typeof d.Paragraph>[] = [];
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
    const text = p.translation?.text ?? t.untranslated;
    for (const para of text.split(/\n\s*\n/)) {
      children.push(
        new d.Paragraph({
          spacing: { after: 180 },
          children: para
            .split("\n")
            .map((line, j) => new d.TextRun({ text: line, break: j ? 1 : 0 })),
        }),
      );
    }
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
  const children: InstanceType<typeof d.Paragraph>[] = [];
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
    const blocks = p.transcription?.blocks ?? [{ text: input.t.unread }];
    for (const b of blocks) {
      children.push(
        new d.Paragraph({
          bidirectional: true,
          alignment: d.AlignmentType.RIGHT,
          spacing: { after: 180 },
          children: b.text.split("\n").map(
            (line, j) =>
              new d.TextRun({
                text: line,
                rightToLeft: true,
                font: "David",
                break: j ? 1 : 0,
              }),
          ),
        }),
      );
    }
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
