"use client";

/**
 * The per-document settings: target language, document type, quality
 * (Claude's effort) and high-resolution reading. Used by the new-document
 * form, the workbench and the default settings.
 */

import { DOCTYPES, QUALITIES, TARGET_LANGS } from "@/lib/model";
import type { Doctype, Quality, TargetLang } from "@/lib/model";

import { Checkbox } from "./Checkbox";
import type { LabelsTexts } from "./labels";
import { Select } from "./Select";

export type DocSettingsTexts = {
  target: string;
  doctype: string;
  quality: string;
  qualityHint: string;
  highRes: string;
  highResHint: string;
};

export type DocSettingsValue = {
  target: TargetLang;
  doctype: Doctype;
  quality: Quality;
  highRes: boolean;
};

export function DocSettingsFields({
  value,
  onChange,
  t,
  labels,
  disabled = false,
}: {
  value: DocSettingsValue;
  onChange: (patch: Partial<DocSettingsValue>) => void;
  t: DocSettingsTexts;
  labels: LabelsTexts;
  disabled?: boolean;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label={t.target}>
        <Select
          aria-label={t.target}
          options={TARGET_LANGS.map((k) => ({
            key: k,
            label: labels.target[k],
          }))}
          value={value.target}
          onChange={(v) => !disabled && onChange({ target: v as TargetLang })}
        />
      </Field>
      <Field label={t.doctype}>
        <Select
          aria-label={t.doctype}
          options={DOCTYPES.map((k) => ({ key: k, label: labels.doctype[k] }))}
          value={value.doctype}
          onChange={(v) => !disabled && onChange({ doctype: v as Doctype })}
        />
      </Field>
      <Field label={t.quality} hint={t.qualityHint}>
        <Select
          aria-label={t.quality}
          options={QUALITIES.map((k) => ({ key: k, label: labels.quality[k] }))}
          value={value.quality}
          onChange={(v) => !disabled && onChange({ quality: v as Quality })}
        />
      </Field>
      <div className="flex items-end pb-1">
        <Checkbox
          checked={value.highRes}
          onChange={(highRes) => !disabled && onChange({ highRes })}
        >
          <span className="text-sm">
            <span className="font-medium">{t.highRes}</span>
            <span className="block text-muted">{t.highResHint}</span>
          </span>
        </Checkbox>
      </div>
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="eyebrow">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </div>
  );
}
