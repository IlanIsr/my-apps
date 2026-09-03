"use client";

import { SignOutButton } from "@clerk/nextjs";

import { useTranslations } from "@/i18n";

export type ConnectPromptTexts = {
  title: string;
  reconnect: string;
  signOut: string;
};

export function ConnectPrompt() {
  const t = useTranslations().connectPrompt;

  return (
    <div className="flex max-w-md flex-col items-start gap-4 py-8">
      <h1 className="text-xl font-bold">{t.title}</h1>
      <p className="text-sm opacity-70">{t.reconnect}</p>
      <SignOutButton>
        <button
          type="button"
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-80"
        >
          {t.signOut}
        </button>
      </SignOutButton>
    </div>
  );
}
