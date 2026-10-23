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
import { fuzzyMatch } from "@/lib/fuzzy";
import { createShareLinkAction } from "../../anniversaries/actions";
import { Button } from "../Button";
import { Checkbox } from "../Checkbox";
import { HebDate } from "../HebDate";
import { TextInput } from "../TextInput";

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
  search: string;
  noResults: string;
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
  const [query, setQuery] = useState("");

  // Search only filters what's shown — selection of hidden items is kept, and
  // "select all / clear all" act on the visible ones.
  const visible = anniversaries.filter((a) =>
    fuzzyMatch(query, [a.name, a.hebrewName ?? "", a.hebDateLabel].join(" ")),
  );
  const setVisible = (on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev);
      for (const a of visible) {
        if (on) next.add(a.id);
        else next.delete(a.id);
      }
      return next;
    });

  // Freeze the page behind the modal while it's open.
  useEffect(() => {
    const { style } = document.documentElement;
    const previous = style.overflow;
    style.overflow = "hidden";
    return () => {
      style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    const onKey =(e: KeyboardEvent) => {
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
        className="flex max-h-[85vh] w-full max-w-md flex-col gap-4 overflow-y-auto overscroll-contain rounded-card border border-border bg-card p-5 shadow-xl"
      >
        <div>
          <h2 className="font-display text-xl font-semibold">{t.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t.intro}</p>
        </div>

        {link ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">{t.linkIntro}</p>
            <div className="flex items-center gap-2">
              <TextInput
                readOnly
                value={link}
                dir="ltr"
                onFocus={(e) => e.target.select()}
                className="flex-1"
              />
              <Button onClick={copyLink} variant="outline" className="shrink-0">
                {copied ? t.copied : t.copy}
              </Button>
            </div>
            <p className="text-xs text-subtle-foreground">{t.expiresIn}</p>
            <Button onClick={onClose} variant="outline" className="self-start">
              {t.cancel}
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex flex-col gap-4">
            {anniversaries.length > 5 && (
              <TextInput
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.search}
                aria-label={t.search}
              />
            )}

            <div className="flex items-center justify-between text-xs">
              <span className="text-subtle-foreground">
                {selected.size}/{anniversaries.length}
              </span>
              <div className="flex gap-2">
                <Button onClick={() => setVisible(true)} variant="ghost">
                  {t.selectAll}
                </Button>
                <Button onClick={() => setVisible(false)} variant="ghost">
                  {t.clearAll}
                </Button>
              </div>
            </div>

            {visible.length === 0 && (
              <p className="py-2 text-center text-sm text-muted-foreground">
                {t.noResults}
              </p>
            )}
            <ul className="flex flex-col divide-y divide-hairline overflow-hidden rounded-field border border-border empty:hidden">
              {visible.map((a) => (
                <li key={a.id}>
                  <Checkbox
                    checked={selected.has(a.id)}
                    onChange={() => toggle(a.id)}
                    className="flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-sm hover:bg-sunken"
                  >
                    <span className="font-display">{a.name}</span>
                    <span
                      className={`ms-auto text-[11px] ${
                        a.type === "yahrzeit"
                          ? "text-yahrzeit"
                          : "text-birthday"
                      }`}
                    >
                      <HebDate hebDate={a.hebDate} label={a.hebDateLabel} />
                    </span>
                  </Checkbox>
                </li>
              ))}
            </ul>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <div className="flex gap-2">
              <Button type="submit" disabled={pending}>
                {pending ? t.generating : t.generate}
              </Button>
              <Button onClick={onClose} disabled={pending} variant="outline">
                {t.cancel}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
