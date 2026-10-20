"use client";

/**
 * Bottom sheet on phones, centred dialog from `sm`. Closes on backdrop click
 * and Escape.
 */

import { useEffect } from "react";

import { Button } from "./Button";

export type ModalTexts = { close: string };

export function Modal({
  title,
  onClose,
  t,
  children,
}: {
  title: string;
  onClose: () => void;
  t: ModalTexts;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 sm:items-center sm:p-5"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-surface px-4 pt-5 pb-[calc(20px+env(safe-area-inset-bottom))] shadow-card sm:rounded-2xl sm:px-6"
      >
        <div className="mb-3.5 flex items-center justify-between">
          <h2 className="text-[19px]">{title}</h2>
          <Button
            variant="ghost"
            size="sm"
            isIconOnly
            onClick={onClose}
            aria-label={t.close}
            className="rounded-full text-muted"
          >
            ✕
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Label + control + optional hint, stacked. */
export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3.5 flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-[12.5px] font-semibold text-muted"
      >
        {label}
      </label>
      {children}
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </div>
  );
}

/** `onSubmit` handler that keeps the form's values (unlike `action`, which resets them). */
export function onFormSubmit(fn: (form: FormData) => unknown) {
  return (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void fn(new FormData(e.currentTarget));
  };
}
