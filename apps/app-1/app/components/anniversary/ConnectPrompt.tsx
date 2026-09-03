"use client";

import { SignOutButton } from "@clerk/nextjs";

import { useI18n } from "@/i18n/context";

export function ConnectPrompt() {
  const { t } = useI18n();

  return (
    <div className="flex max-w-md flex-col items-start gap-4 py-8">
      <h1 className="text-xl font-bold">{t.calendar.connect.title}</h1>
      <p className="text-sm opacity-70">{t.calendar.connect.reconnect}</p>
      <SignOutButton>
        <button
          type="button"
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-80"
        >
          {t.calendar.connect.signOut}
        </button>
      </SignOutButton>
    </div>
  );
}
