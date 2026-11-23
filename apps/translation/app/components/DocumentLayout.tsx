"use client";

/**
 * The page drawn like the original: blocks typed as transcribed (header at
 * the top, centred title, tables, framed stamps, signatures, footer at the
 * bottom), on a sheet with the scan's proportions — the Hebrew original (each
 * block framed with its type) or the translation's final layout. The review
 * flags are highlighted in the text (`MarkedText`), numbered like the list.
 */

import type { KeyedFlag } from "@/lib/checks";
import { marksIn, segmentsOf, type Side } from "@/lib/highlights";
import { looksLikeTable, tableRows } from "@/lib/layout";
import type { Block, BlockType } from "@/lib/model";

export type NumberedFlag = { flag: KeyedFlag; n: number };

const SEV_TAG = {
  info: "[--tag:var(--info)] [--tag-soft:var(--info-soft)]",
  warn: "[--tag:var(--warn)] [--tag-soft:var(--warn-soft)]",
  bad: "[--tag:var(--bad)] [--tag-soft:var(--bad-soft)]",
} as const;

/** `text` with the flags' passages highlighted. With `transparent`, only the
 * highlights show (the backdrop of the translation editor). */
export function MarkedText({
  text,
  flags,
  side,
  selected,
  onSelect,
  transparent = false,
}: {
  text: string;
  flags: readonly NumberedFlag[];
  side: Side;
  selected: string | null;
  onSelect?: (key: string) => void;
  transparent?: boolean;
}) {
  const segments = segmentsOf(text, marksIn(text, flags, side));
  return (
    <>
      {segments.map((s, i) =>
        s.mark ? (
          <mark
            key={i}
            data-key={s.mark.key}
            data-n={s.first ? s.mark.n : undefined}
            onClick={onSelect ? () => onSelect(s.mark!.key) : undefined}
            className={`flag-mark ${SEV_TAG[s.mark.sev]} ${
              selected === s.mark.key ? "is-selected" : ""
            } ${transparent ? "text-transparent" : "text-inherit"} ${
              onSelect ? "cursor-pointer" : ""
            }`}
          >
            {s.text}
          </mark>
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
    </>
  );
}

const BLOCK_STYLE: Record<BlockType, string> = {
  header:
    "border-b border-line pb-2 text-center text-[0.8em] leading-snug text-muted",
  title: "text-center text-[1.2em] font-bold tracking-wide",
  paragraph: "text-justify",
  table: "",
  stamp:
    "w-fit max-w-[70%] self-end rounded-md border-2 border-double border-line-strong px-3 py-2 text-center text-[0.9em] italic",
  signature: "w-fit max-w-[70%] self-end px-2 italic",
  handwriting: "italic",
  footer:
    "mt-auto border-t border-line pt-2 text-center text-[0.8em] leading-snug text-muted",
  other: "",
};

export function DocumentLayout({
  blocks,
  flags,
  side,
  selected,
  onSelect,
  aspect,
  blockLabels,
}: {
  blocks: readonly Block[];
  flags: readonly NumberedFlag[];
  side: Side;
  selected: string | null;
  onSelect: (key: string) => void;
  /** width / height of the original page. */
  aspect: number | null;
  /** Frame each block with its type (the Hebrew original). */
  blockLabels?: Record<BlockType, string>;
}) {
  const he = side === "source";
  return (
    <div
      dir={he ? "rtl" : "ltr"}
      lang={he ? "he" : undefined}
      style={aspect ? { aspectRatio: aspect } : undefined}
      className={`mx-auto flex w-full max-w-[640px] flex-col gap-3 rounded-sm border border-line bg-surface px-[7%] py-[6%] shadow-md ${
        he ? "font-he text-[16px] leading-[1.75]" : "font-doc text-[15px] leading-relaxed"
      }`}
    >
      {blocks.map((b, i) => {
        const marked = (text: string) => (
          <MarkedText
            text={text}
            flags={flags}
            side={side}
            selected={selected}
            onSelect={onSelect}
          />
        );
        const table = b.type === "table" || looksLikeTable(b.text);
        const body = table ? (
          <table className="w-full border-collapse text-[0.9em]">
            <tbody>
              {tableRows(b.text).map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (
                    <td
                      key={c}
                      className="border border-line px-2 py-1 align-top"
                    >
                      {marked(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="whitespace-pre-wrap">{marked(b.text)}</div>
        );
        return blockLabels ? (
          <section
            key={i}
            className={`relative rounded border border-dashed border-line-strong px-2.5 pt-3.5 pb-1.5 ${BLOCK_STYLE[b.type]}`}
          >
            <span className="absolute -top-2.5 start-2 rounded bg-surface px-1 font-sans text-[10.5px] font-semibold tracking-wide text-muted not-italic">
              {blockLabels[b.type]}
            </span>
            {body}
          </section>
        ) : (
          <section key={i} className={BLOCK_STYLE[b.type]}>
            {body}
          </section>
        );
      })}
    </div>
  );
}
