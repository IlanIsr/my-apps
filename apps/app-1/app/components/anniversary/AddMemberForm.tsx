"use client";

import { useState } from "react";

import { useLanguage } from "@/i18n";
import type { Anniversary } from "@repo/anniversaries/person";
import { addMemberAction } from "../../anniversaries/actions";

export type AddMemberFormTexts = {
  label: string;
  placeholder: string;
  notify: string;
  add: string;
  adding: string;
  added: (email: string) => string;
  already: (email: string) => string;
  emailInvalid: string;
  rateLimited: string;
  error: (message: string) => string;
};

export function AddMemberForm({
  anniversary,
  t,
  onAdded,
}: {
  anniversary: Anniversary;
  t: AddMemberFormTexts;
  onAdded: () => void;
}) {
  const { locale } = useLanguage();
  const [email, setEmail] = useState("");
  const [notify, setNotify] = useState(true);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const value = email.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
      setError(t.emailInvalid);
      return;
    }
    setPending(true);
    const result = await addMemberAction({
      id: anniversary.id,
      name: anniversary.name,
      type: anniversary.type,
      email: value,
      notify,
      locale,
    });
    setPending(false);
    if (!result.ok) {
      setError(
        result.error === "email-invalid"
          ? t.emailInvalid
          : result.error === "rate-limited"
            ? t.rateLimited
            : t.error(result.error),
      );
      return;
    }
    setEmail("");
    setMessage(result.data.already ? t.already(value) : t.added(value));
    onAdded();
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-subtle-foreground">
        {t.label}
      </span>
      <div className="flex flex-wrap gap-2">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.placeholder}
          className="min-w-[12rem] flex-1 rounded-field border border-border bg-card px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
          dir="ltr"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-field bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40"
        >
          {pending ? t.adding : t.add}
        </button>
      </div>
      <label className="flex items-center gap-2 text-xs text-subtle-foreground">
        <input
          type="checkbox"
          checked={notify}
          onChange={(e) => setNotify(e.target.checked)}
          className="h-3.5 w-3.5 accent-primary"
        />
        {t.notify}
      </label>
      {message && <p className="text-xs text-muted-foreground">{message}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </form>
  );
}
