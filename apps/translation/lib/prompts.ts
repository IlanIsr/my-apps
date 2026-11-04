/**
 * The prompts sent to Claude. Each step has a stable system prompt (the rules)
 * and a per-page user message (the data). Claude replies in JSON, constrained
 * by the schemas in `lib/claude.ts`.
 */

import type {
  Block,
  Doctype,
  NoteLang,
  TargetLang,
  Transcription,
} from "./model";

const LANG_NAME: Record<TargetLang, string> = {
  fr: "French",
  en: "English",
};

const NOTE_LANG_NAME: Record<NoteLang, string> = {
  fr: "French",
  en: "English",
  he: "Hebrew",
};

/** What Claude is told about each document type. */
export const DOCTYPE_HINT: Record<Doctype, string> = {
  auto: "determine it from the content",
  civil: "civil-status record (birth, marriage, divorce, death)",
  poa: "power of attorney (ייפוי כוח)",
  judgment: "judgment or court decision",
  contract: "contract or agreement",
  succession: "will, probate or succession order",
  diploma: "diploma or academic transcript",
  record: "police record extract",
  corporate: "company document (registry extract, minutes, articles)",
  other: "other official document",
};

// ---------------------------------------------------------------------------
// Transcription

export function transcriptionSystem(noteLang: NoteLang): string {
  return [
    "You transcribe ONE page of an Israeli legal or notarial document for a notary who will review and certify a translation of it. Exactness matters more than anything else.",
    "Rules:",
    "- Transcribe exactly what is written, in the original language(s). Do not translate, correct, complete, reorder or summarize.",
    '- Keep every digit, date, ID number, amount, name and abbreviation exactly as written (for example עו"ד, ת.ז., הנ"ל, בע"מ).',
    "- Where something cannot be read with confidence, write [illisible], or [illisible: best partial reading?]. Never guess silently.",
    `- Stamps, seals, signatures and handwriting are their own blocks of the right type; transcribe any legible text in them, or describe them briefly in ${NOTE_LANG_NAME[noteLang]} in square brackets if there is no legible text.`,
    '- Tables: one row per line, cells separated by " | ".',
    '- Letterhead and running lines at the very top or bottom of the page are "header" or "footer" blocks.',
    "- startsMid: true when the page begins in the middle of a sentence continued from a previous page; endsMid: true when its last sentence continues on the next page.",
    `- notes: one short sentence in ${NOTE_LANG_NAME[noteLang]} about reading problems (blur, cut-off edge, rotation, faint stamp), or an empty string.`,
  ].join("\n");
}

export function transcriptionUser(input: {
  bands: boolean;
  pdfText: string | null;
}): string {
  const parts = [
    input.bands
      ? "Image 1 is the whole page (use it for layout and reading order). Image 2 is the upper part and image 3 the lower part of the same page at higher resolution; they overlap by about 12%. Use them to read small print, and transcribe every line exactly once (do not duplicate the overlap)."
      : "The image is the whole page.",
  ];
  if (input.pdfText) {
    parts.push(
      "The PDF also has this embedded text layer. Its characters, digits and spelling are reliable, but its line and word order may be scrambled. Use it for exact characters and numbers, and the image for order and structure:\n<<<\n" +
        input.pdfText +
        "\n>>>",
    );
  }
  parts.push("Transcribe the page.");
  return parts.join("\n\n");
}

// ---------------------------------------------------------------------------
// Translation

export function translationSystem(input: {
  target: TargetLang;
  noteLang: NoteLang;
}): string {
  const lang = LANG_NAME[input.target];
  const notes = NOTE_LANG_NAME[input.noteLang];
  return [
    `You translate ONE page of an Israeli legal or notarial document from Hebrew into ${lang}. A notary will review it and certify it, so it must be faithful and complete.`,
    "Rules:",
    "- Translate every block, in the same order. Add nothing, omit nothing, never summarize.",
    `- Use the register of certified notarial translations in ${lang}. Transliterate proper names consistently, following the transliterations already used in the document when given.`,
    "- Keep ID numbers, amounts, plot numbers, reference numbers and numeric dates exactly as in the original; keep numeric dates numeric (e.g. 14.10.2026). Hebrew-calendar dates are translated and may be followed by their Gregorian equivalent only if it is written in the original.",
    `- Render stamps, signatures and handwriting as bracketed descriptions in ${lang}, e.g. ${input.target === "fr" ? "[Cachet : …], [Signature]" : "[Stamp: …], [Signature]"}.`,
    `- Keep [illisible] markers, rendered as ${input.target === "fr" ? "[illisible]" : "[illegible]"}.`,
    "- Separate blocks with one blank line. No Hebrew letters may remain in the translation, except inside a parenthesised original term when a legal term has no equivalent.",
    "- When a glossary is given, always use its renderings.",
    '- The page may begin or end in the middle of a sentence that continues from or onto a neighbouring page. Translate only THIS page. If it begins mid-sentence, start with "…"; if it ends mid-sentence, end with "…". Use the context only to make those fragments read correctly, and never translate the context itself.',
    `- terms: only legal terms, institutions or abbreviations with no exact equivalent or several plausible renderings, at most 6, each with a one-sentence note in ${notes} on why the notary should check it. Empty when there are none.`,
    `- doubts: short notes in ${notes} about any passage whose meaning is uncertain. Empty when there are none.`,
  ].join("\n");
}

const blockList = (blocks: Block[]) =>
  blocks.map((b) => `[${b.type}] ${b.text}`).join("\n\n");

export function translationUser(input: {
  doctype: Doctype;
  title: string;
  page: Transcription;
  previous: string | null;
  next: string | null;
  glossary: { source: string; rendering: string }[];
}): string {
  const parts = [`Document type: ${DOCTYPE_HINT[input.doctype]}.`];
  if (input.glossary.length) {
    parts.push(
      "Mandatory glossary (Hebrew = rendering):\n" +
        input.glossary.map((g) => `${g.source} = ${g.rendering}`).join("\n"),
    );
  }
  if (input.previous) {
    parts.push(
      "CONTEXT, end of previous page (do not translate):\n" + input.previous,
    );
  }
  if (input.next) {
    parts.push(
      "CONTEXT, start of next page (do not translate):\n" + input.next,
    );
  }
  parts.push(
    "PAGE TO TRANSLATE (blocks in order, type in brackets):\n" +
      blockList(input.page.blocks),
  );
  return parts.join("\n\n");
}

// ---------------------------------------------------------------------------
// Assisted edit

export function editSystem(input: {
  target: TargetLang;
  noteLang: NoteLang;
}): string {
  return [
    `You help a notary edit the ${LANG_NAME[input.target]} translation of one page of an Israeli legal document.`,
    "Apply exactly the notary's requested change and nothing else. Do not rephrase, correct or improve any other part. Keep the blank lines between blocks.",
    `changed: one short sentence in ${NOTE_LANG_NAME[input.noteLang]} saying what you changed.`,
  ].join("\n");
}

export function editUser(input: {
  page: Transcription;
  translation: string;
  remark: string;
  instruction: string;
}): string {
  return [
    input.remark
      ? `The request relates to this reviewer remark: "${input.remark}".`
      : "",
    "Original page (Hebrew):\n" +
      input.page.blocks.map((b) => b.text).join("\n\n"),
    "Current translation:\n<<<\n" + input.translation + "\n>>>",
    "Notary's request: " + input.instruction,
  ]
    .filter(Boolean)
    .join("\n\n");
}
