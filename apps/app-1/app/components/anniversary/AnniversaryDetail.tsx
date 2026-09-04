"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { LOCALE_TAG, useLanguage } from "@/i18n";
import { occurrencesSince, type Anniversary } from "@repo/anniversaries/person";
import {
  addAnniversaryAction,
  leaveAnniversaryAction,
} from "../../anniversaries/actions";
import { BackLink } from "../BackLink";
import { Eyebrow } from "../Eyebrow";
import { Ornament } from "../Ornament";
import { EditEventForm, type EditEventFormTexts } from "./EditEventForm";

export type AnniversaryDetailTexts = {
  back: string;
  eyebrow: { birthday: string; yahrzeit: string };
  hebDate: string;
  family: string;
  upcoming: string;
  edit: string;
  viewInCalendar: string;
  nightfall: string;
  join: string;
  joining: string;
  leave: string;
  leaving: string;
  leaveConfirm: string;
  rateLimited: string;
  age: (n: number) => string;
  since: (n: number) => string;
  error: (message: string) => string;
  editForm: EditEventFormTexts;
};

function initials(email: string): string {
  const local = email.split("@")[0] ?? email;
  const parts = local.split(/[.\-_]+/).filter(Boolean);
  const letters =
    parts.length > 1
      ? `${parts[0]![0]}${parts[1]![0]}`
      : local.slice(0, 2);
  return letters.toUpperCase();
}

export function AnniversaryDetail({
  anniversary,
  t,
}: {
  anniversary: Anniversary;
  t: AnniversaryDetailTexts;
}) {
  const { locale } = useLanguage();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const yahrzeit = anniversary.type === "yahrzeit";
  const accentText = yahrzeit ? "text-yahrzeit" : "text-birthday";

  const fmt = (iso: string) =>
    iso
      ? new Date(iso).toLocaleDateString(LOCALE_TAG[locale], {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "";

  const showError = (code: string) =>
    setError(code === "rate-limited" ? t.rateLimited : t.error(code));

  const handleLeave = () => {
    if (!confirm(t.leaveConfirm)) return;
    startTransition(async () => {
      const result = await leaveAnniversaryAction(anniversary.id);
      if (!result.ok) {
        showError(result.error);
        return;
      }
      router.push("/anniversaries");
    });
  };

  const handleJoin = () => {
    startTransition(async () => {
      const result = await addAnniversaryAction({
        name: anniversary.name,
        type: anniversary.type,
        hebDay: anniversary.hebDate.day,
        hebMonth: anniversary.hebDate.month,
        hebYear: anniversary.hebYear,
        years: anniversary.events.length,
        sharedEmails: [],
        locale,
      });
      if (!result.ok) {
        showError(result.error);
        return;
      }
      router.refresh();
    });
  };

  const shownMembers = anniversary.members.slice(0, 3);
  const extraMembers = anniversary.members.length - shownMembers.length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <BackLink href="/anniversaries" label={t.back} />

        <div>
          <Eyebrow tone={yahrzeit ? "yahrzeit" : "birthday"} marker>
            {yahrzeit ? t.eyebrow.yahrzeit : t.eyebrow.birthday}
          </Eyebrow>
          <h1
            className={`mt-2 font-display text-3xl tracking-tight ${
              yahrzeit
                ? "font-normal text-yahrzeit-foreground"
                : "font-semibold"
            }`}
          >
            {anniversary.name}
          </h1>
          <p className={`mt-0.5 font-display text-lg ${accentText}`} dir="ltr">
            {anniversary.hebDateLabel}
          </p>
          <Ornament full className="mt-4" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          {anniversary.admin && anniversary.members.length > 0 ? (
            <div>
              <Eyebrow>{t.family}</Eyebrow>
              <div className="mt-2 flex">
                {shownMembers.map((email, i) => (
                  <span
                    key={email}
                    title={email}
                    className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-background text-[11px] font-bold text-primary-foreground ${
                      yahrzeit ? "bg-yahrzeit" : "bg-primary"
                    } ${i > 0 ? "-ms-2" : ""}`}
                  >
                    {initials(email)}
                  </span>
                ))}
                {extraMembers > 0 && (
                  <span className="-ms-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-muted text-[11px] font-bold text-muted-foreground">
                    +{extraMembers}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <span />
          )}

          {anniversary.joined ? (
            <button
              type="button"
              onClick={handleLeave}
              disabled={pending}
              className="shrink-0 rounded-field border border-border-strong bg-card px-4 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-40"
            >
              {pending ? t.leaving : t.leave}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleJoin}
              disabled={pending}
              className={`shrink-0 rounded-field px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-40 ${
                yahrzeit ? "bg-yahrzeit" : "bg-primary"
              }`}
            >
              {pending ? t.joining : t.join}
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-col gap-2">
        <Eyebrow>{t.upcoming}</Eyebrow>

        <ul className="flex flex-col divide-y divide-hairline overflow-hidden rounded-card border border-border bg-card">
          {anniversary.events.map((event) => {
            const count = occurrencesSince(anniversary.hebYear, event.year);
            return (
              <li key={event.id} className="flex flex-col">
                <div className="flex items-center gap-3 p-3.5 text-sm">
                  <div className="min-w-0 flex-1">
                    <div className="font-display font-semibold">
                      {fmt(event.date)}
                    </div>
                    <div className="text-[12.5px] text-muted-foreground">
                      {event.time ? `${event.time} · ` : ""}
                      {t.nightfall}
                      {count !== null &&
                        ` · ${yahrzeit ? t.since(count) : t.age(count)}`}
                    </div>
                  </div>
                  {event.htmlLink && (
                    <a
                      href={event.htmlLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-[12.5px] font-semibold whitespace-nowrap ${accentText} hover:underline`}
                    >
                      {t.viewInCalendar}
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setEditingId(editingId === event.id ? null : event.id)
                    }
                    disabled={pending}
                    className="rounded-pill border border-border px-2.5 py-1 text-[12.5px] text-muted-foreground hover:text-foreground disabled:opacity-40"
                  >
                    {t.edit}
                  </button>
                </div>

                {editingId === event.id && (
                  <EditEventForm
                    anniversary={anniversary}
                    event={event}
                    t={t.editForm}
                    onDone={() => {
                      setEditingId(null);
                      router.refresh();
                    }}
                  />
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
