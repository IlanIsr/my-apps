"use client";

/**
 * "Réglages": album name, the kids (add, rename, recolour, remove) and full
 * reset. The card list itself is fixed (`lib/album-cards.ts`).
 */

import { useState } from "react";

import {
  COLLECTOR_COLORS,
  LIMITS,
  type Album,
  type Collector,
} from "@/lib/album-logic";
import { collectorStyle } from "@/lib/colors";

import { Button } from "./Button";
import { Field, Modal, onFormSubmit, type ModalTexts } from "./Modal";
import { TextInput } from "./TextInput";

export type SettingsTexts = {
  title: string;
  albumName: string;
  save: string;
  kidsTitle: string;
  kidsHint: string;
  kidName: string;
  addKid: string;
  removeKid: string;
  confirmRemoveKid: (name: string) => string;
  colorLabel: (color: string) => string;
  resetHint: string;
  reset: string;
  resetTitle: string;
  resetConfirm: string;
  resetButton: string;
  cancel: string;
};

export type SettingsHandlers = {
  updateSettings: (input: { name: string }) => Promise<boolean>;
  addCollector: (input: { name: string; color: string }) => Promise<boolean>;
  updateCollector: (
    id: string,
    input: { name: string; color: string },
  ) => Promise<boolean>;
  deleteCollector: (id: string) => Promise<boolean>;
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
        <Button
          key={c}
          variant="ghost"
          isIconOnly
          onClick={() => onChange(c)}
          aria-label={t.colorLabel(c)}
          aria-pressed={value === c}
          style={collectorStyle(c)}
          className={`size-6 min-w-0 rounded-full bg-kc hover:bg-kc ${
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
        <TextInput
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={LIMITS.name}
          aria-label={t.kidName}
        />
        {dirty && (
          <Button
            variant="primary"
            disabled={!name.trim()}
            onClick={() =>
              handlers.updateCollector(kid.id, { name: name.trim(), color })
            }
          >
            {t.save}
          </Button>
        )}
      </div>
      <div className="flex items-center justify-between gap-2">
        <ColorPicker value={color} onChange={setColor} t={t} />
        {confirming ? (
          <span className="flex gap-1.5">
            <Button variant="ghost" onClick={() => setConfirming(false)}>
              {t.cancel}
            </Button>
            <Button
              variant="danger"
              onClick={() => handlers.deleteCollector(kid.id)}
            >
              {t.removeKid}
            </Button>
          </span>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="text-danger"
            onClick={() => setConfirming(true)}
          >
            {t.removeKid}
          </Button>
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
        <TextInput
          name="kid"
          required
          maxLength={LIMITS.name}
          placeholder={t.kidName}
          aria-label={t.kidName}
        />
        <Button type="submit" variant="primary" className="whitespace-nowrap">
          {t.addKid}
        </Button>
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
  const [confirmingReset, setConfirmingReset] = useState(false);

  if (confirmingReset) {
    return (
      <Modal title={t.resetTitle} onClose={onClose} t={modalT}>
        <p className="mb-4.5 text-sm text-muted">{t.resetConfirm}</p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmingReset(false)}>
            {t.cancel}
          </Button>
          <Button
            variant="danger"
            onClick={async () => (await handlers.reset()) && onClose()}
          >
            {t.resetButton}
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title={t.title} onClose={onClose} t={modalT}>
      <form
        onSubmit={onFormSubmit((form) =>
          handlers.updateSettings({
            name: String(form.get("name") ?? "").trim(),
          }),
        )}
      >
        <Field label={t.albumName} htmlFor="s-name">
          <TextInput
            id="s-name"
            name="name"
            required
            maxLength={LIMITS.name}
            defaultValue={album.name}
          />
        </Field>
        <div className="flex justify-end">
          <Button type="submit" variant="primary">
            {t.save}
          </Button>
        </div>
      </form>

      <Divider />
      <KidsSection kids={kids} handlers={handlers} t={t} />

      <Divider />
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted">{t.resetHint}</span>
        <Button variant="danger" onClick={() => setConfirmingReset(true)}>
          {t.reset}
        </Button>
      </div>
    </Modal>
  );
}
