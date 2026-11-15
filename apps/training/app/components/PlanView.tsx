"use client";

/**
 * `/study/[id]` — one study plan: today's portion (tick it off, write its
 * note), where it stands (behind → the rest is spread up to the end date, or
 * push the end date back), the coming sessions, every amud by perek, and the
 * notes on this passage. Route boundary: reads its texts.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { SimpleModal } from "@repo/ui/modal";

import {
  deletePlanAction,
  setStudiedAction,
  updatePlanRhythmAction,
} from "@/app/actions";
import { LOCALE_TAG, useLanguage, useTranslations } from "@/i18n";
import {
  amudim as amudRange,
  amudLabel,
  endDateForPace,
  masekhetName,
  masekhetOf,
  nominalPace,
  perekIndexOf,
  planProgress,
  rangeLabel,
  shiftedEndDate,
  upcoming,
  type Note,
  type StudyPlan,
} from "@/lib/study-logic";

import { Button } from "./Button";
import { Checkbox } from "./Checkbox";
import { ErrorLine, fill, LinkButton, PageHeader } from "./common";
import { formatDay, useToday } from "./PassagePicker";
import { PACES, paceLabel, weekdayNames } from "./PlanFormView";
import { Segmented } from "./Segmented";
import { Select } from "./Select";
import { ProgressBar, StatusPill, type StudyTexts } from "./StudyView";
import { TextInput } from "./TextInput";

export type PlanTexts = {
  eyebrow: string;
  back: string;
  today: string;
  nextSession: string;
  nothingToday: string;
  markAll: string;
  writeNote: string;
  lexicon: string;
  endsOn: string;
  catchUp: string;
  shift: string;
  coming: string;
  showAll: string;
  showLess: string;
  byPerek: string;
  perek: string;
  notes: string;
  noNotes: string;
  editRhythm: string;
  delete: string;
  rhythm: {
    title: string;
    byPace: string;
    byDate: string;
    pace: string;
    paceOption: string;
    endDate: string;
    days: string;
    save: string;
    cancel: string;
  };
  deleteConfirm: {
    title: string;
    description: string;
    cancel: string;
    confirm: string;
  };
};

const COMING = 10;

export function PlanView({
  plan: initial,
  notes,
}: {
  plan: StudyPlan;
  notes: Note[];
}) {
  const messages = useTranslations();
  const t = messages.plan;
  const status: StudyTexts = messages.study;
  const { locale } = useLanguage();
  const tag = LOCALE_TAG[locale];
  const hebrew = locale === "he";
  const router = useRouter();
  const today = useToday();

  const [plan, setPlan] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(false);

  const m = masekhetOf(plan.book);
  const progress = today ? planProgress(plan, today) : null;
  const sessions = today ? upcoming(plan, today) : [];
  const todaySession = sessions[0]?.date === today ? sessions[0] : undefined;
  const coming = todaySession ? sessions.slice(1) : sessions;
  const shifted = today ? shiftedEndDate(plan, today) : plan.endDate;

  async function mark(amudim: number[], studied: boolean) {
    if (!today || amudim.length === 0) return;
    const previous = plan;
    const next = { ...plan.studied };
    for (const a of amudim) {
      if (studied) next[a] = today;
      else delete next[a];
    }
    setPlan({ ...plan, studied: next });
    const result = await setStudiedAction(
      plan.id,
      amudim,
      studied ? today : null,
    );
    if (!result.ok) {
      setPlan(previous);
      setError(messages.errors[result.error]);
    } else setPlan(result.data);
  }

  async function saveRhythm(
    rhythm: Pick<StudyPlan, "pace" | "weekdays" | "endDate">,
  ) {
    setBusy(true);
    const result = await updatePlanRhythmAction(plan.id, rhythm);
    setBusy(false);
    if (!result.ok) {
      setError(messages.errors[result.error]);
      return;
    }
    setPlan(result.data);
    setEditing(false);
  }

  async function confirmDelete() {
    setBusy(true);
    const result = await deletePlanAction(plan.id);
    if (!result.ok) {
      setBusy(false);
      setError(messages.errors[result.error]);
      return;
    }
    router.push("/study");
  }

  const noteHref = (start: number, end: number) =>
    `/notes/new?plan=${plan.id}&book=${encodeURIComponent(plan.book)}&start=${start}&end=${end}`;

  const perekName = (amud: number) =>
    m
      ? `${t.perek} ${perekIndexOf(m, amud) + 1} — ${m.perakim[perekIndexOf(m, amud)]!.he}`
      : "";

  return (
    <>
      <PageHeader
        eyebrow={t.eyebrow}
        title={`${masekhetName(plan.book, hebrew)} ${rangeLabel(plan.startAmud, plan.endAmud, hebrew)}`}
      >
        <Button size="sm" onClick={() => setEditing(true)}>
          {t.editRhythm}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setDeleting(true)}>
          {t.delete}
        </Button>
      </PageHeader>

      <ErrorLine message={error} />

      {progress && (
        <div className="sheet mb-4 space-y-3 p-4">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <StatusPill
              behind={progress.behind}
              done={progress.done}
              t={status}
            />
            <span className="text-sm text-muted">
              {fill(t.endsOn, {
                date: formatDay(plan.endDate, tag, { dateStyle: "long" }),
              })}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <ProgressBar value={progress.studied} total={progress.total} />
            </div>
            <span className="font-mono text-xs text-muted">
              {fill(status.progress, {
                studied: progress.studied,
                total: progress.total,
              })}
            </span>
          </div>
          {progress.behind > 0 && !progress.done && (
            <div className="flex flex-wrap items-center gap-3 rounded-md bg-pencil-soft px-3 py-2 text-sm">
              <span className="flex-1">{t.catchUp}</span>
              {shifted > plan.endDate && (
                <Button
                  size="sm"
                  disabled={busy}
                  onClick={() =>
                    saveRhythm({
                      pace: plan.pace,
                      weekdays: plan.weekdays,
                      endDate: shifted,
                    })
                  }
                >
                  {fill(t.shift, { date: formatDay(shifted, tag) })}
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {today && (
        <section className="sheet ruled mb-6 space-y-3 p-5">
          <h2 className="text-xl">
            {todaySession
              ? t.today
              : coming[0]
                ? fill(t.nextSession, { date: formatDay(coming[0].date, tag) })
                : t.nothingToday}
          </h2>
          {(todaySession ?? coming[0]) && (
            <>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {(todaySession ?? coming[0])!.amudim.map((a) => (
                  <Checkbox
                    key={a}
                    checked={plan.studied[a] !== undefined}
                    onChange={(on) => mark([a], on)}
                    className="gap-2 font-medium"
                  >
                    {amudLabel(a, hebrew)}
                  </Checkbox>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  const s = (todaySession ?? coming[0])!;
                  const left = s.amudim.filter(
                    (a) => plan.studied[a] === undefined,
                  );
                  return (
                    <>
                      {left.length > 0 && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => mark(left, true)}
                        >
                          {t.markAll}
                        </Button>
                      )}
                      <LinkButton
                        size="sm"
                        href={noteHref(s.amudim[0]!, s.amudim.at(-1)!)}
                      >
                        {t.writeNote}
                      </LinkButton>
                      <LinkButton
                        size="sm"
                        variant="ghost"
                        href={`/lexicon/${encodeURIComponent(plan.book)}?amud=${s.amudim[0]}`}
                      >
                        {t.lexicon}
                      </LinkButton>
                    </>
                  );
                })()}
              </div>
            </>
          )}
        </section>
      )}

      {coming.length > 0 && (
        <section className="mb-6 space-y-2">
          <h2 className="text-lg">{t.coming}</h2>
          <ul className="sheet divide-y divide-line">
            {(showAll ? coming : coming.slice(0, COMING)).map((s) => (
              <li
                key={s.date}
                className="flex flex-wrap items-baseline gap-x-3 px-4 py-2 text-sm"
              >
                <span className="w-28 shrink-0 text-muted">
                  {formatDay(s.date, tag)}
                </span>
                <span className="font-medium">
                  {rangeLabel(s.amudim[0]!, s.amudim.at(-1)!, hebrew)}
                </span>
                <span className="text-xs text-muted">
                  {perekName(s.amudim[0]!)}
                </span>
              </li>
            ))}
          </ul>
          {coming.length > COMING && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? t.showLess : fill(t.showAll, { count: coming.length })}
            </Button>
          )}
        </section>
      )}

      {m && (
        <section className="mb-6 space-y-3">
          <h2 className="text-lg">{t.byPerek}</h2>
          {m.perakim.map((p, i) => {
            const start = Math.max(p.start, plan.startAmud);
            const end = Math.min(p.end, plan.endAmud);
            if (start > end) return null;
            // An amud two perakim share is shown once, with the one starting there.
            const own = amudRange(start, end).filter(
              (a) => perekIndexOf(m, a) === i,
            );
            if (own.length === 0) return null;
            return (
              <div key={i} className="sheet space-y-2 p-3">
                <div className="text-sm font-medium">
                  {t.perek} {i + 1} — {p.he}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {own.map((a) => {
                    const done = plan.studied[a] !== undefined;
                    return (
                      <Button
                        key={a}
                        size="sm"
                        variant={done ? "primary" : "outline"}
                        aria-pressed={done}
                        onClick={() => mark([a], !done)}
                        className="min-w-12 font-mono"
                      >
                        {amudLabel(a, hebrew)}
                      </Button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>
      )}

      <section className="space-y-2">
        <h2 className="text-lg">{t.notes}</h2>
        {notes.length === 0 ? (
          <p className="text-sm text-muted">{t.noNotes}</p>
        ) : (
          <ul className="space-y-2">
            {notes.map((note) => (
              <li key={note.id}>
                <Link
                  href={`/notes/${note.id}`}
                  className="sheet block px-4 py-2 hover:border-line-strong"
                >
                  <span className="font-mono text-xs text-muted">
                    {rangeLabel(note.startAmud, note.endAmud, hebrew)}
                  </span>{" "}
                  <span className="font-medium">
                    {note.title || note.text.slice(0, 80)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <LinkButton size="sm" href={noteHref(plan.startAmud, plan.startAmud)}>
          {t.writeNote}
        </LinkButton>
      </section>

      {editing && today && (
        <RhythmModal
          plan={plan}
          today={today}
          busy={busy}
          onSave={saveRhythm}
          onClose={() => setEditing(false)}
          t={t.rhythm}
          tag={tag}
        />
      )}

      <SimpleModal
        isOpen={deleting}
        onClose={() => setDeleting(false)}
        isDismissable={!busy}
        title={t.deleteConfirm.title}
        description={t.deleteConfirm.description}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleting(false)}>
              {t.deleteConfirm.cancel}
            </Button>
            <Button variant="danger" disabled={busy} onClick={confirmDelete}>
              {t.deleteConfirm.confirm}
            </Button>
          </>
        }
      />
    </>
  );
}

function RhythmModal({
  plan,
  today,
  busy,
  onSave,
  onClose,
  t,
  tag,
}: {
  plan: StudyPlan;
  today: string;
  busy: boolean;
  onSave: (rhythm: Pick<StudyPlan, "pace" | "weekdays" | "endDate">) => void;
  onClose: () => void;
  t: PlanTexts["rhythm"];
  tag: string;
}) {
  const [mode, setMode] = useState<"pace" | "date">(
    plan.pace ? "pace" : "date",
  );
  const [pace, setPace] = useState(nominalPace(plan));
  const [endDate, setEndDate] = useState(plan.endDate);
  const [weekdays, setWeekdays] = useState(plan.weekdays);
  const names = weekdayNames(tag);

  const left = amudRange(plan.startAmud, plan.endAmud).filter(
    (a) => plan.studied[a] === undefined,
  ).length;
  const valid = weekdays.length > 0 && (mode === "pace" || endDate >= today);

  return (
    <SimpleModal
      isOpen
      onClose={onClose}
      isDismissable={!busy}
      title={t.title}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t.cancel}
          </Button>
          <Button
            variant="primary"
            disabled={!valid || busy}
            onClick={() =>
              onSave(
                mode === "pace"
                  ? {
                      pace,
                      weekdays,
                      endDate: left
                        ? endDateForPace(today, weekdays, left, pace)
                        : plan.endDate,
                    }
                  : { pace: null, weekdays, endDate },
              )
            }
          >
            {t.save}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Segmented
          aria-label={t.title}
          options={[
            { value: "pace", label: t.byPace },
            { value: "date", label: t.byDate },
          ]}
          value={mode}
          onChange={setMode}
        />
        {mode === "pace" ? (
          <label className="block space-y-1.5">
            <span className="text-sm text-muted">{t.pace}</span>
            <Select
              aria-label={t.pace}
              options={PACES.map((p) => ({
                key: String(p),
                label: paceLabel(p, t.paceOption),
              }))}
              value={String(pace)}
              onChange={(key) => setPace(Number(key))}
              className="w-full"
            />
          </label>
        ) : (
          <label className="block space-y-1.5">
            <span className="text-sm text-muted">{t.endDate}</span>
            <TextInput
              type="date"
              value={endDate}
              min={today}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
        )}
        <div className="space-y-2">
          <span className="text-sm font-medium">{t.days}</span>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {names.map((name, day) => (
              <Checkbox
                key={day}
                checked={weekdays.includes(day)}
                onChange={(on) =>
                  setWeekdays((days) =>
                    on ? [...days, day].sort() : days.filter((d) => d !== day),
                  )
                }
                className="gap-1.5 text-sm"
              >
                {name}
              </Checkbox>
            ))}
          </div>
        </div>
      </div>
    </SimpleModal>
  );
}
