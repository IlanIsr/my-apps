"use client";

/**
 * The drop zone: drag files onto it, or click / press it to pick them. A
 * `<label>` around a visually hidden native file input — the accessible way
 * to open the system picker (no HeroUI equivalent).
 */

import { useId, useState } from "react";

import { ACCEPT } from "@/lib/ingest";

export type FileDropTexts = { title: string; hint: string; busy: string };

export function FileDrop({
  onFiles,
  t,
  busy = false,
  compact = false,
}: {
  onFiles: (files: File[]) => void;
  t: FileDropTexts;
  busy?: boolean;
  compact?: boolean;
}) {
  const id = useId();
  const [over, setOver] = useState(false);

  return (
    <label
      htmlFor={id}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (!busy) onFiles([...e.dataTransfer.files]);
      }}
      className={`relative flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-[1.5px] border-dashed px-5 text-center transition-colors focus-within:outline-2 focus-within:outline-accent ${
        compact ? "min-h-24 py-4" : "min-h-44 py-8"
      } ${over ? "border-accent bg-accent-soft" : "border-line-strong bg-sunken hover:border-accent hover:bg-accent-soft"}`}
    >
      <input
        id={id}
        type="file"
        multiple
        accept={ACCEPT}
        disabled={busy}
        className="sr-only"
        onChange={(e) => {
          const files = [...(e.target.files ?? [])];
          e.target.value = "";
          if (files.length) onFiles(files);
        }}
      />
      <strong className={compact ? "text-sm" : "text-base"}>
        {busy ? t.busy : t.title}
      </strong>
      {!compact && <small className="max-w-[60ch] text-muted">{t.hint}</small>}
    </label>
  );
}
