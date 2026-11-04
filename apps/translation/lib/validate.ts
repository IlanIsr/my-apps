/**
 * Server-side input validation for the actions and API routes. Each helper
 * returns the cleaned value or throws `InvalidInputError` — never trust what
 * the client sent.
 */

import {
  BLOCK_TYPES,
  DOCTYPES,
  LIMITS,
  NOTE_LANGS,
  PAGE_ORIGINS,
  QUALITIES,
  TARGET_LANGS,
  type Block,
  type DocumentInput,
  type DocumentPatch,
  type GlossaryEntry,
  type NoteLang,
  type PageInput,
  type Resolution,
  type Settings,
  type TargetLang,
  type Term,
  type Transcription,
  type Translation,
} from "./model";

export class InvalidInputError extends Error {
  constructor(field: string) {
    super(`invalid-${field}`);
    this.name = "InvalidInputError";
  }
}

type Obj = Record<string, unknown>;

function obj(value: unknown, field: string): Obj {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new InvalidInputError(field);
  }
  return value as Obj;
}

export function text(value: unknown, field: string, max: number): string {
  if (typeof value !== "string") throw new InvalidInputError(field);
  const trimmed = value.trim();
  if (trimmed.length > max) throw new InvalidInputError(field);
  return trimmed;
}

/** Like `text` but keeps inner whitespace / line breaks as typed. */
function rawText(value: unknown, field: string, max: number): string {
  if (typeof value !== "string" || value.length > max) {
    throw new InvalidInputError(field);
  }
  return value;
}

function nullableText(value: unknown, field: string, max: number) {
  if (value === null || value === undefined) return null;
  return text(value, field, max) || null;
}

function oneOf<T extends string>(
  values: readonly T[],
  value: unknown,
  field: string,
): T {
  if (!(values as readonly unknown[]).includes(value)) {
    throw new InvalidInputError(field);
  }
  return value as T;
}

function bool(value: unknown, field: string): boolean {
  if (typeof value !== "boolean") throw new InvalidInputError(field);
  return value;
}

function int(value: unknown, field: string, min: number, max: number): number {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    throw new InvalidInputError(field);
  }
  if (value < min || value > max) throw new InvalidInputError(field);
  return value;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID.test(value);
}

export function id(value: unknown, field = "id"): string {
  if (typeof value !== "string" || !UUID.test(value)) {
    throw new InvalidInputError(field);
  }
  return value;
}

export function ids(value: unknown, max: number): string[] {
  if (!Array.isArray(value) || value.length > max) {
    throw new InvalidInputError("ids");
  }
  return [...new Set(value.map((v) => id(v)))];
}

export const targetLang = (v: unknown): TargetLang =>
  oneOf(TARGET_LANGS, v, "target");

export const noteLang = (v: unknown): NoteLang =>
  oneOf(NOTE_LANGS, v ?? "fr", "noteLang");

export function blocks(value: unknown): Block[] {
  if (!Array.isArray(value) || value.length > LIMITS.blocks) {
    throw new InvalidInputError("blocks");
  }
  return value
    .map((b) => {
      const o = obj(b, "block");
      return {
        type: oneOf(BLOCK_TYPES, o.type, "blockType"),
        text: text(o.text, "blockText", LIMITS.blockText),
      };
    })
    .filter((b) => b.text);
}

function transcription(value: unknown): Transcription | null {
  if (value === null || value === undefined) return null;
  const o = obj(value, "transcription");
  const list = blocks(o.blocks);
  if (!list.length) throw new InvalidInputError("transcription");
  return {
    blocks: list,
    startsMid: bool(o.startsMid ?? false, "startsMid"),
    endsMid: bool(o.endsMid ?? false, "endsMid"),
    notes: text(o.notes ?? "", "notes", 1000),
  };
}

function strings(value: unknown, field: string, maxItems: number): string[] {
  if (!Array.isArray(value) || value.length > maxItems) {
    throw new InvalidInputError(field);
  }
  return value.map((s) => text(s, field, 1000));
}

function translation(value: unknown): Translation | null {
  if (value === null || value === undefined) return null;
  const o = obj(value, "translation");
  const terms = Array.isArray(o.terms) ? o.terms.slice(0, 10) : [];
  return {
    text: rawText(o.text, "translationText", LIMITS.translation),
    terms: terms.map((t): Term => {
      const to = obj(t, "term");
      return {
        source: text(to.source, "term", 500),
        rendering: text(to.rendering, "term", 500),
        note: text(to.note ?? "", "term", 1000),
      };
    }),
    doubts: strings(o.doubts ?? [], "doubts", 10),
    lang: targetLang(o.lang),
  };
}

function pageInput(value: unknown): PageInput {
  const o = obj(value, "page");
  const origin = oneOf(PAGE_ORIGINS, o.origin, "origin");
  return {
    origin,
    source: text(o.source ?? "", "source", LIMITS.source),
    pdfText: nullableText(o.pdfText, "pdfText", LIMITS.pdfText),
    textNote: nullableText(o.textNote, "textNote", 200),
    width: int(o.width ?? 0, "width", 0, 20000),
    height: int(o.height ?? 0, "height", 0, 20000),
    hasImage: bool(o.hasImage ?? false, "hasImage"),
    transcription: transcription(o.transcription),
    translation: translation(o.translation),
  };
}

export function pageInputs(value: unknown): PageInput[] {
  if (!Array.isArray(value) || value.length > LIMITS.pages) {
    throw new InvalidInputError("pages");
  }
  return value.map(pageInput);
}

export function documentInput(value: unknown): DocumentInput {
  const o = obj(value, "document");
  const title = text(o.title, "title", LIMITS.title);
  if (!title) throw new InvalidInputError("title");
  const pages = pageInputs(o.pages);
  if (!pages.length) throw new InvalidInputError("pages");
  return {
    title,
    target: targetLang(o.target),
    doctype: oneOf(DOCTYPES, o.doctype, "doctype"),
    quality: oneOf(QUALITIES, o.quality, "quality"),
    highRes: bool(o.highRes, "highRes"),
    pages,
  };
}

export function documentPatch(value: unknown): DocumentPatch {
  const o = obj(value, "patch");
  const patch: DocumentPatch = {};
  if (o.title !== undefined) {
    const title = text(o.title, "title", LIMITS.title);
    if (!title) throw new InvalidInputError("title");
    patch.title = title;
  }
  if (o.target !== undefined) patch.target = targetLang(o.target);
  if (o.doctype !== undefined) {
    patch.doctype = oneOf(DOCTYPES, o.doctype, "doctype");
  }
  if (o.quality !== undefined) {
    patch.quality = oneOf(QUALITIES, o.quality, "quality");
  }
  if (o.highRes !== undefined) patch.highRes = bool(o.highRes, "highRes");
  return patch;
}

export function translationText(value: unknown): string {
  return rawText(value, "translationText", LIMITS.translation);
}

export function resolved(value: unknown): Record<string, Resolution> {
  const o = obj(value, "resolved");
  const entries = Object.entries(o);
  if (entries.length > 200) throw new InvalidInputError("resolved");
  return Object.fromEntries(
    entries.map(([key, r]) => {
      const ro = obj(r, "resolution");
      const side = (v: unknown) =>
        v === null || v === undefined
          ? null
          : rawText(v, "resolution", LIMITS.translation);
      return [
        text(key, "resolutionKey", 2000),
        {
          label: text(ro.label, "resolution", 2000),
          before: side(ro.before),
          after: side(ro.after),
        },
      ];
    }),
  );
}

export function reviewPatch(value: unknown) {
  const o = obj(value, "review");
  return {
    resolved: o.resolved === undefined ? undefined : resolved(o.resolved),
    reviewed:
      o.reviewed === undefined ? undefined : bool(o.reviewed, "reviewed"),
    text: o.text === undefined ? undefined : translationText(o.text),
  };
}

export function glossaryEntries(value: unknown): Omit<GlossaryEntry, "id">[] {
  if (!Array.isArray(value) || value.length > LIMITS.glossaryEntries) {
    throw new InvalidInputError("glossary");
  }
  return value
    .map((e) => glossaryEntry(e))
    .filter((e) => e.source && e.rendering);
}

export function glossaryEntry(value: unknown): Omit<GlossaryEntry, "id"> {
  const o = obj(value, "entry");
  return {
    lang: targetLang(o.lang),
    source: text(o.source, "source", LIMITS.glossaryText),
    rendering: text(o.rendering, "rendering", LIMITS.glossaryText),
  };
}

export function settings(value: unknown): Settings {
  const o = obj(value, "settings");
  const cert = obj(o.certification, "certification");
  return {
    translatorName: text(o.translatorName ?? "", "translatorName", 200),
    certification: {
      fr: text(cert.fr ?? "", "certification", LIMITS.certification),
      en: text(cert.en ?? "", "certification", LIMITS.certification),
    },
    defaultTarget: targetLang(o.defaultTarget),
    defaultDoctype: oneOf(DOCTYPES, o.defaultDoctype, "doctype"),
    defaultQuality: oneOf(QUALITIES, o.defaultQuality, "quality"),
    defaultHighRes: bool(o.defaultHighRes, "highRes"),
  };
}

export const EDIT_ACTIONS = ["replace", "add", "remove"] as const;
export const ADD_POSITIONS = ["after", "before", "end", "note"] as const;

export function editRequest(value: unknown) {
  const o = obj(value, "edit");
  const action = oneOf(EDIT_ACTIONS, o.action, "action");
  return {
    action,
    passage: text(o.passage ?? "", "passage", LIMITS.instruction),
    newText: text(o.newText ?? "", "newText", LIMITS.instruction),
    position:
      action === "add" ? oneOf(ADD_POSITIONS, o.position, "position") : null,
    remark: text(o.remark ?? "", "remark", LIMITS.instruction),
    translation: translationText(o.translation),
    noteLang: noteLang(o.noteLang),
  };
}
