"use client";

/**
 * "Share my list" modal (opened from {@link AnniversaryList}): pick one email
 * and tick which of your anniversaries to add them to — all checked by default.
 * Calls {@link bulkShareAction}, which loops `addMember` over the selection and
 * returns added / already-shared / failed counts (and flags a mid-run Google
 * Calendar rate limit). Backdrop click or Escape closes it (unless a share is
 * in flight).
 */

import { useEffect, useState } from "react";

import { useLanguage } from "@/i18n";
import type { Anniversary } from "@repo/anniversaries/person";
import { bulkShareAction } from "../../anniversaries/actions";

/** Text for {@link ShareListModal}. */
export type ShareListModalTexts = {
  title: string;
  intro: string;
  shareWith: string;
  placeholder: string;
  notify: string;
  selectAll: string;
  clearAll: string;
  share: string;
  sharing: string;
  cancel: string;
  emailInvalid: string;
  nothingSelected: string;
  rateLimited: string;
  result: (added: number, already: number, failed: number) => string;
  error: (message: string) => string;
};

export function ShareListModal({
  anniversaries,
  t,
  onClose,
  onShared,
}: {
  anniversaries: Anniversary[];
  t: ShareListModalTexts;
  onClose: () => void;
  onShared: () => void;
}) {
  const { locale } = useLanguage();
  const [email, setEmail] = useState("");
  const [notify, setNotify] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(anniversaries.map((a) => a.id)),
  );
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, pending]);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const value = email.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
      setError(t.emailInvalid);
      return;
    }
    if (selected.size === 0) {
      setError(t.nothingSelected);
      return;
    }
    setPending(true);
    const result = await bulkShareAction({
      email: value,
      items: anniversaries
        .filter((a) => selected.has(a.id))
        .map((a) => ({ id: a.id, name: a.name, type: a.type })),
      notify,
      locale,
    });
    setPending(false);
    if (!result.ok) {
      setError(
        result.error === "email-invalid"
          ? t.emailInvalid
          : result.error === "nothing-selected"
            ? t.nothingSelected
            : t.error(result.error),
      );
      return;
    }
    const { added, already, failed, rateLimited } = result.data;
    setMessage(
      (rateLimited ? `${t.rateLimited} ` : "") +
        t.result(added, already, failed),
    );
    onShared();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={() => !pending && onClose()}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-md flex-col gap-4 overflow-y-auto rounded-card border border-border bg-card p-5 shadow-xl"
      >
        <div>
          <h2 className="font-display text-xl font-semibold">{t.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t.intro}</p>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-subtle-foreground">
            {t.shareWith}
          </span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.placeholder}
            className="rounded-field border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
            dir="ltr"
          />
        </label>

        <div className="flex items-center justify-between text-xs">
          <span className="text-subtle-foreground">
            {selected.size}/{anniversaries.length}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                setSelected(new Set(anniversaries.map((a) => a.id)))
              }
              className="text-muted-foreground hover:text-foreground"
            >
              {t.selectAll}
            </button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="text-muted-foreground hover:text-foreground"
            >
              {t.clearAll}
            </button>
          </div>
        </div>

        <ul className="flex flex-col divide-y divide-hairline overflow-hidden rounded-field border border-border">
          {anniversaries.map((a) => (
            <li key={a.id}>
              <label className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm hover:bg-sunken">
                <input
                  type="checkbox"
                  checked={selected.has(a.id)}
                  onChange={() => toggle(a.id)}
                  className="h-4 w-4 accent-primary"
                />
                <span className="font-display">{a.name}</span>
                <span
                  className={`ms-auto text-[11px] ${
                    a.type === "yahrzeit" ? "text-yahrzeit" : "text-birthday"
                  }`}
                  dir="ltr"
                >
                  {a.hebDateLabel}
                </span>
              </label>
            </li>
          ))}
        </ul>

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

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-field bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40"
          >
            {pending ? t.sharing : t.share}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="rounded-field border border-border px-4 py-2 text-sm font-medium"
          >
            {t.cancel}
          </button>
        </div>
      </form>
    </div>
  );
}
