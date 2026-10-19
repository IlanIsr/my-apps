"use client";

/**
 * "Réglages": album name / cards per page, the kids (add, rename, recolour,
 * remove), list import, numbered bulk-add and full reset.
 */

import { useState } from "react";

import {
  COLLECTOR_COLORS,
  LIMITS,
  parseImportText,
  type Album,
  type Collector,
  type ImportEntry,
} from "@/lib/album-logic";
import { collectorStyle } from "@/lib/colors";

import { Field, Modal, onFormSubmit, type ModalTexts } from "./Modal";

export type SettingsTexts = {
  title: string;
  albumName: string;
  perPage: string;
  save: string;
  kidsTitle: string;
  kidsHint: string;
  kidName: string;
  addKid: string;
  removeKid: string;
  confirmRemoveKid: (name: string) => string;
  colorLabel: (color: string) => string;
  importLabel: string;
  importPlaceholder: string;
  importHint: string;
  importButton: string;
  importEmpty: string;
  importDone: (added: number, updated: number) => string;
  bulkLabel: string;
  bulkPlaceholder: string;
  bulkButton: string;
  resetHint: string;
  reset: string;
  resetTitle: string;
  resetConfirm: string;
  resetButton: string;
  cancel: string;
};

export type SettingsHandlers = {
  updateSettings: (input: {
    name: string;
    perPage: number;
  }) => Promise<boolean>;
  addCollector: (input: { name: string; color: string }) => Promise<boolean>;
  updateCollector: (
    id: string,
    input: { name: string; color: string },
  ) => Promise<boolean>;
  deleteCollector: (id: string) => Promise<boolean>;
  importCards: (
    entries: ImportEntry[],
  ) => Promise<{ added: number; updated: number } | null>;
  bulkAdd: (count: number) => Promise<boolean>;
  reset: () => Promise<boolean>;
};

const Divider = () => <hr className="my-4.5 border-line" />;

function ColorPicker({
  value,
  onChange,
  t,
}: {
  value: string;
  onChange: (color: string) => void;
  t: SettingsTexts;
}) {
  return (
    <div className="flex gap-1.5">
      {COLLECTOR_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          aria-label={t.colorLabel(c)}
          aria-pressed={value === c}
          style={collectorStyle(c)}
          className={`size-6 rounded-full bg-kc ${
            value === c
              ? "ring-2 ring-foreground ring-offset-2 ring-offset-surface"
              : ""
          }`}
        />
      ))}
    </div>
  );
}

function KidRow({
  kid,
  handlers,
  t,
}: {
  kid: Collector;
  handlers: SettingsHandlers;
  t: SettingsTexts;
}) {
  const [name, setName] = useState(kid.name);
  const [color, setColor] = useState(kid.color);
  const [confirming, setConfirming] = useState(false);
  const dirty = name.trim() !== kid.name || color !== kid.color;

  return (
    <div className="flex flex-col gap-2 border-t border-line py-3 first:border-t-0">
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={LIMITS.name}
          aria-label={t.kidName}
          className="field-input"
        />
        {dirty && (
          <button
            type="button"
            className="btn btn-primary"
            disabled={!name.trim()}
            onClick={() =>
              handlers.updateCollector(kid.id, { name: name.trim(), color })
            }
          >
            {t.save}
          </button>
        )}
      </div>
      <div className="flex items-center justify-between gap-2">
        <ColorPicker value={color} onChange={setColor} t={t} />
        {confirming ? (
          <span className="flex gap-1.5">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setConfirming(false)}
            >
              {t.cancel}
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => handlers.deleteCollector(kid.id)}
            >
              {t.removeKid}
            </button>
          </span>
        ) : (
          <button
            type="button"
            className="text-sm font-semibold text-danger"
            onClick={() => setConfirming(true)}
          >
            {t.removeKid}
          </button>
        )}
      </div>
      {confirming && (
        <p className="text-xs text-muted">{t.confirmRemoveKid(kid.name)}</p>
      )}
    </div>
  );
}

function AddKidForm({
  kids,
  handlers,
  t,
}: {
  kids: Collector[];
  handlers: SettingsHandlers;
  t: SettingsTexts;
}) {
  const [color, setColor] = useState<string>(
    COLLECTOR_COLORS.find((c) => !kids.some((k) => k.color === c)) ??
      COLLECTOR_COLORS[0],
  );

  async function add(form: FormData) {
    const name = String(form.get("kid") ?? "").trim();
    if (name) await handlers.addCollector({ name, color });
  }

  return (
    <form
      onSubmit={onFormSubmit(add)}
      className="mt-2 flex flex-col gap-2 rounded-xl bg-sunken p-3"
    >
      <div className="flex gap-2">
        <input
          name="kid"
          required
          maxLength={LIMITS.name}
          placeholder={t.kidName}
          aria-label={t.kidName}
          className="field-input"
        />
        <button type="submit" className="btn btn-primary whitespace-nowrap">
          {t.addKid}
        </button>
      </div>
      <ColorPicker value={color} onChange={setColor} t={t} />
    </form>
  );
}

function KidsSection({
  kids,
  handlers,
  t,
}: {
  kids: Collector[];
  handlers: SettingsHandlers;
  t: SettingsTexts;
}) {
  return (
    <section>
      <h3 className="text-[15px]">{t.kidsTitle}</h3>
      <p className="mb-2 text-xs text-muted">{t.kidsHint}</p>
      {kids.map((kid) => (
        // Re-mount after a save so the row picks up the stored values.
        <KidRow
          key={`${kid.id}:${kid.name}:${kid.color}`}
          kid={kid}
          handlers={handlers}
          t={t}
        />
      ))}
      {kids.length < LIMITS.collectors && (
        // Re-mount after an add: clears the name, suggests the next free colour.
        <AddKidForm key={kids.length} kids={kids} handlers={handlers} t={t} />
      )}
    </section>
  );
}

export function SettingsModal({
  album,
  kids,
  handlers,
  onClose,
  t,
  modalT,
}: {
  album: Album;
  kids: Collector[];
  handlers: SettingsHandlers;
  onClose: () => void;
  t: SettingsTexts;
  modalT: ModalTexts;
}) {
  const [importMsg, setImportMsg] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);

  if (confirmingReset) {
    return (
      <Modal title={t.resetTitle} onClose={onClose} t={modalT}>
        <p className="mb-4.5 text-sm text-muted">{t.resetConfirm}</p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setConfirmingReset(false)}
          >
            {t.cancel}
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={async () => (await handlers.reset()) && onClose()}
          >
            {t.resetButton}
          </button>
        </div>
      </Modal>
    );
  }

  async function runImport(form: FormData) {
    const entries = parseImportText(String(form.get("text") ?? ""));
    if (!entries.length) {
      setImportMsg({ ok: false, text: t.importEmpty });
      return;
    }
    const summary = await handlers.importCards(entries);
    setImportMsg(
      summary && {
        ok: true,
        text: t.importDone(summary.added, summary.updated),
      },
    );
  }

  return (
    <Modal title={t.title} onClose={onClose} t={modalT}>
      <form
        onSubmit={onFormSubmit((form) =>
          handlers.updateSettings({
            name: String(form.get("name") ?? "").trim(),
            perPage: Number(form.get("perPage")),
          }),
        )}
      >
        <Field label={t.albumName} htmlFor="s-name">
          <input
            id="s-name"
            name="name"
            required
            maxLength={LIMITS.name}
            defaultValue={album.name}
            className="field-input"
          />
        </Field>
        <Field label={t.perPage} htmlFor="s-perpage">
          <input
            id="s-perpage"
            name="perPage"
            type="number"
            min={1}
            max={LIMITS.perPage}
            required
            defaultValue={album.cardsPerPage}
            className="field-input"
          />
        </Field>
        <div className="flex justify-end">
          <button type="submit" className="btn btn-primary">
            {t.save}
          </button>
        </div>
      </form>

      <Divider />
      <KidsSection kids={kids} handlers={handlers} t={t} />

      <Divider />
      <form onSubmit={onFormSubmit(runImport)}>
        <Field label={t.importLabel} htmlFor="s-import" hint={t.importHint}>
          <textarea
            id="s-import"
            name="text"
            rows={6}
            placeholder={t.importPlaceholder}
            className="min-h-25 w-full resize-y rounded-lg border border-line bg-surface px-3 py-2 font-mono text-[12.5px] leading-normal"
          />
        </Field>
        {importMsg && (
          <p
            className={`text-[12.5px] font-semibold ${importMsg.ok ? "text-accent" : "text-danger"}`}
          >
            {importMsg.text}
          </p>
        )}
        <div className="mt-2 flex justify-end">
          <button type="submit" className="btn">
            {t.importButton}
          </button>
        </div>
      </form>

      <Divider />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const count = Number(new FormData(form).get("count"));
          void handlers.bulkAdd(count).then((ok) => ok && form.reset());
        }}
      >
        <Field label={t.bulkLabel} htmlFor="s-bulk">
          <input
            id="s-bulk"
            name="count"
            type="number"
            min={1}
            max={LIMITS.bulkAdd}
            required
            placeholder={t.bulkPlaceholder}
            className="field-input"
          />
        </Field>
        <div className="flex justify-end">
          <button type="submit" className="btn">
            {t.bulkButton}
          </button>
        </div>
      </form>

      <Divider />
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted">{t.resetHint}</span>
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => setConfirmingReset(true)}
        >
          {t.reset}
        </button>
      </div>
    </Modal>
  );
}
