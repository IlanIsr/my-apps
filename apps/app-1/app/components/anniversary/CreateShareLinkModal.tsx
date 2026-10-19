"use client";

/**
 * Generates a 24h, reusable-by-multiple-people share link covering a chosen
 * subset of anniversaries. Opened from {@link AnniversaryList} (seeded with
 * every anniversary the viewer has joined) or from {@link AnniversaryDetail}
 * (seeded with just that one). Calls {@link createShareLinkAction}; whoever
 * opens the resulting URL picks which of the included anniversaries to join
 * — always themselves, never an email typed here. Backdrop click or Escape
 * closes it (unless a generation is in flight).
 */

import { useEffect, useState } from "react";

import type { Anniversary } from "@repo/anniversaries/person";
import { resolveErrorMessage } from "@repo/utils";
import { createShareLinkAction } from "../../anniversaries/actions";

/** Text for {@link CreateShareLinkModal}. */
export type CreateShareLinkModalTexts = {
  title: string;
  intro: string;
  selectAll: string;
  clearAll: string;
  generate: string;
  generating: string;
  cancel: string;
  copy: string;
  copied: string;
  linkIntro: string;
  expiresIn: string;
  nothingSelected: string;
  error: (message: string) => string;
};

export function CreateShareLinkModal({
  anniversaries,
  t,
  onClose,
}: {
  anniversaries: Anniversary[];
  t: CreateShareLinkModalTexts;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(anniversaries.map((a) => a.id)),
  );
  const [pending, setPending] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
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
    if (selected.size === 0) {
      setError(t.nothingSelected);
      return;
    }
    setPending(true);
    const result = await createShareLinkAction([...selected]);
    setPending(false);
    if (!result.ok) {
      setError(
        resolveErrorMessage(
          result.error,
          { "no-anniversaries-selected": t.nothingSelected },
          t.error,
        ),
      );
      return;
    }
    setLink(`${window.location.origin}/anniversaries/share/${result.data.id}`);
  };

  const copyLink = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={() => !pending && onClose()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-md flex-col gap-4 overflow-y-auto rounded-card border border-border bg-card p-5 shadow-xl"
      >
        <div>
          <h2 className="font-display text-xl font-semibold">{t.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t.intro}</p>
        </div>

        {link ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">{t.linkIntro}</p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={link}
                dir="ltr"
                onFocus={(e) => e.target.select()}
                className="flex-1 rounded-field border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
              <button
                type="button"
                onClick={copyLink}
                className="shrink-0 rounded-field border border-border px-3 py-2 text-sm font-medium"
              >
                {copied ? t.copied : t.copy}
              </button>
            </div>
            <p className="text-xs text-subtle-foreground">{t.expiresIn}</p>
            <button
              type="button"
              onClick={onClose}
              className="self-start rounded-field border border-border px-4 py-2 text-sm font-medium"
            >
              {t.cancel}
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-4">
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

            {error && <p className="text-xs text-destructive">{error}</p>}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={pending}
                className="rounded-field bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40"
              >
                {pending ? t.generating : t.generate}
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
        )}
      </div>
    </div>
  );
}
