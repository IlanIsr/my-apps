"use client";

/**
 * The `/contact` form: a kind (comment / bug / suggestion) and a message,
 * sent by {@link sendContactAction} as an email to the app owner from the
 * signed-in user.
 */

import { useState } from "react";

import { MESSAGE_MAX, type ContactKind } from "@/lib/contact";

import { Button } from "../components/Button";
import { Segmented } from "../components/Segmented";
import { TextArea } from "../components/TextArea";
import { sendContactAction } from "./actions";

/** Text for {@link ContactForm}. */
export type ContactFormTexts = {
  title: string;
  intro: string;
  kind: string;
  kinds: Record<ContactKind, string>;
  message: string;
  placeholder: string;
  send: string;
  sending: string;
  sent: string;
  sendAnother: string;
  errors: {
    empty: string;
    "not-signed-in": string;
    invalid: string;
    "not-configured": string;
    failed: string;
  };
};

export function ContactForm({ t }: { t: ContactFormTexts }) {
  const [kind, setKind] = useState<ContactKind>("comment");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!message.trim()) {
      setError(t.errors.empty);
      return;
    }
    setPending(true);
    setError(null);
    const result = await sendContactAction({ kind, message });
    setPending(false);
    if (!result.ok) {
      setError(t.errors[result.error]);
      return;
    }
    setSent(true);
    setMessage("");
  };

  const label =
    "font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-subtle-foreground";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-3xl font-semibold">{t.title}</h1>
        <p className="text-sm text-muted-foreground">{t.intro}</p>
      </div>

      {sent ? (
        <div className="flex flex-col items-start gap-3 rounded-card border border-border bg-card p-5">
          <p className="text-sm">{t.sent}</p>
          <Button variant="outline" size="sm" onClick={() => setSent(false)}>
            {t.sendAnother}
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className="flex max-w-md flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <span className={label}>{t.kind}</span>
            <Segmented
              aria-label={t.kind}
              value={kind}
              onChange={setKind}
              options={[
                { value: "comment", label: t.kinds.comment },
                { value: "bug", label: t.kinds.bug },
                { value: "suggestion", label: t.kinds.suggestion },
              ]}
            />
          </div>
          <label className="flex flex-col gap-1.5">
            <span className={label}>{t.message}</span>
            <TextArea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t.placeholder}
              maxLength={MESSAGE_MAX}
              rows={6}
            />
          </label>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={pending} className="self-start">
            {pending ? t.sending : t.send}
          </Button>
        </form>
      )}
    </div>
  );
}
