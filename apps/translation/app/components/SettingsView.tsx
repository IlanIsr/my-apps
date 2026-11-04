"use client";

/**
 * `/settings` — the translator's name and certification statement (printed
 * at the end of every exported translation, per target language) and the
 * defaults for new documents. Route boundary: reads its texts.
 */

import { useState } from "react";

import { saveSettingsAction } from "@/app/actions";
import { useTranslations } from "@/i18n";
import { TARGET_LANGS, type Settings } from "@/lib/model";

import { Button } from "./Button";
import { ErrorLine, PageHeader } from "./common";
import { DocSettingsFields, Field } from "./DocSettingsFields";
import { TextArea } from "./TextArea";
import { TextInput } from "./TextInput";

export type SettingsTexts = {
  eyebrow: string;
  title: string;
  certificationHeading: string;
  certificationIntro: string;
  translatorName: string;
  translatorNameHint: string;
  certification: string;
  certificationPlaceholder: Record<"fr" | "en", string>;
  useTemplate: string;
  template: Record<"fr" | "en", string>;
  defaultsHeading: string;
  defaultsIntro: string;
  save: string;
  saved: string;
};

export function SettingsView({ initial }: { initial: Settings }) {
  const messages = useTranslations();
  const t = messages.settings;
  const [settings, setSettings] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    setNotice(null);
    const result = await saveSettingsAction(settings);
    setSaving(false);
    if (result.ok) {
      setSettings(result.data);
      setNotice(t.saved);
    } else setError(messages.errors[result.error]);
  }

  return (
    <form
      className="mx-auto max-w-3xl space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        void save();
      }}
    >
      <PageHeader eyebrow={t.eyebrow} title={t.title} />

      <section className="sheet space-y-4 p-5">
        <h2 className="text-lg">{t.certificationHeading}</h2>
        <p className="text-sm text-muted">{t.certificationIntro}</p>
        <Field label={t.translatorName} hint={t.translatorNameHint}>
          <TextInput
            value={settings.translatorName}
            maxLength={200}
            onChange={(e) =>
              setSettings({ ...settings, translatorName: e.target.value })
            }
          />
        </Field>
        {TARGET_LANGS.map((lang) => (
          <Field
            key={lang}
            label={`${t.certification} · ${messages.labels.target[lang]}`}
          >
            <TextArea
              lang={lang}
              rows={5}
              value={settings.certification[lang]}
              placeholder={t.certificationPlaceholder[lang]}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  certification: {
                    ...settings.certification,
                    [lang]: e.target.value,
                  },
                })
              }
              className="font-doc"
            />
            {!settings.certification[lang] && (
              <div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setSettings({
                      ...settings,
                      certification: {
                        ...settings.certification,
                        [lang]: t.template[lang],
                      },
                    })
                  }
                >
                  {t.useTemplate}
                </Button>
              </div>
            )}
          </Field>
        ))}
      </section>

      <section className="sheet space-y-4 p-5">
        <h2 className="text-lg">{t.defaultsHeading}</h2>
        <p className="text-sm text-muted">{t.defaultsIntro}</p>
        <DocSettingsFields
          value={{
            target: settings.defaultTarget,
            doctype: settings.defaultDoctype,
            quality: settings.defaultQuality,
            highRes: settings.defaultHighRes,
          }}
          onChange={(patch) =>
            setSettings({
              ...settings,
              ...(patch.target && { defaultTarget: patch.target }),
              ...(patch.doctype && { defaultDoctype: patch.doctype }),
              ...(patch.quality && { defaultQuality: patch.quality }),
              ...(patch.highRes !== undefined && {
                defaultHighRes: patch.highRes,
              }),
            })
          }
          t={messages.docSettings}
          labels={messages.labels}
        />
      </section>

      <ErrorLine message={error} />
      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary" disabled={saving}>
          {t.save}
        </Button>
        {notice && (
          <span role="status" className="text-sm text-ok">
            ✓ {notice}
          </span>
        )}
      </div>
    </form>
  );
}
