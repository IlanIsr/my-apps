"use client";

/**
 * `/study/new` — a new study plan: subject (Guemara for now), passage, rhythm
 * (a pace per session, or an end date), study days and start date. Shows the
 * resulting programme length before saving. Route boundary: reads its texts.
 */

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createPlanAction } from "@/app/actions";
import { LOCALE_TAG, useLanguage, useTranslations } from "@/i18n";
import {
  addDays,
  endDateForPace,
  nextStudyDay,
  studyDays,
  type StudyPlanInput,
} from "@/lib/study-logic";
import { SHASS } from "@/lib/shass";

import { Button } from "./Button";
import { Checkbox } from "./Checkbox";
import { ErrorLine, fill, PageHeader } from "./common";
import {
  formatDay,
  PassagePicker,
  useToday,
  wholeMasekhet,
  type Passage,
  type PassagePickerTexts,
} from "./PassagePicker";
import { Segmented } from "./Segmented";
import { Select } from "./Select";
import { TextInput } from "./TextInput";

export type PlanFormTexts = {
  eyebrow: string;
  title: string;
  subject: string;
  subjects: { gemara: string };
  passage: PassagePickerTexts;
  rhythm: string;
  byPace: string;
  byDate: string;
  pace: string;
  paceOption: string;
  endDate: string;
  days: string;
  startDate: string;
  summaryPace: string;
  summaryDate: string;
  summaryTooShort: string;
  noDays: string;
  submit: string;
  cancel: string;
};

export const PACES = [1, 2, 3, 4, 6, 8, 10, 14, 20];

/** Sunday-first weekday names for `tag`, e.g. "dim." … "sam.". */
export function weekdayNames(tag: string): string[] {
  // 2024-01-07 was a Sunday.
  return Array.from({ length: 7 }, (_, i) =>
    formatDay(addDays("2024-01-07", i), tag, { weekday: "short" }),
  );
}

/** "1 amud (½ daf)"-style label: amudim + dapim. */
export function paceLabel(pace: number, template: string): string {
  const daf = pace / 2;
  return fill(template, {
    amudim: pace,
    dapim: Number.isInteger(daf)
      ? daf
      : daf === 0.5
        ? "½"
        : `${Math.floor(daf)}½`,
  });
}

export function PlanFormView() {
  const messages = useTranslations();
  const t = messages.planForm;
  const { locale } = useLanguage();
  const tag = LOCALE_TAG[locale];
  const hebrew = locale === "he";
  const router = useRouter();
  const today = useToday();

  const [passage, setPassage] = useState<Passage>(wholeMasekhet(SHASS[0]!));
  const [mode, setMode] = useState<"pace" | "date">("pace");
  const [pace, setPace] = useState(2);
  const [endDate, setEndDate] = useState("");
  const [weekdays, setWeekdays] = useState([0, 1, 2, 3, 4, 5]);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = startDate ?? today ?? "";
  const count = passage.endAmud - passage.startAmud + 1;
  const names = weekdayNames(tag);

  // The programme this would give.
  let plan: StudyPlanInput | null = null;
  let summary = "";
  if (start && weekdays.length) {
    if (mode === "pace") {
      const end = endDateForPace(start, weekdays, count, pace);
      plan = {
        ...passage,
        subject: "gemara",
        pace,
        weekdays,
        startDate: start,
        endDate: end,
      };
      summary = fill(t.summaryPace, {
        sessions: Math.ceil(count / pace),
        end: formatDay(end, tag, { dateStyle: "long" }),
      });
    } else if (endDate) {
      const sessions = studyDays(
        nextStudyDay(start, weekdays),
        endDate,
        weekdays,
      ).length;
      if (sessions === 0) summary = t.summaryTooShort;
      else {
        plan = {
          ...passage,
          subject: "gemara",
          pace: null,
          weekdays,
          startDate: start,
          endDate,
        };
        summary = fill(t.summaryDate, {
          sessions,
          perSession: Math.max(1, Math.round((count / sessions) * 10) / 10),
        });
      }
    }
  }

  async function submit() {
    if (!plan) return;
    setBusy(true);
    setError(null);
    const result = await createPlanAction(plan);
    if (!result.ok) {
      setBusy(false);
      setError(messages.errors[result.error]);
      return;
    }
    router.push(`/study/${result.data.id}`);
  }

  return (
    <>
      <PageHeader eyebrow={t.eyebrow} title={t.title} />

      <div className="sheet space-y-6 p-5">
        <div className="space-y-1.5">
          <span className="text-sm font-medium">{t.subject}</span>
          <Segmented
            aria-label={t.subject}
            options={[{ value: "gemara", label: t.subjects.gemara }]}
            value="gemara"
            onChange={() => {}}
          />
        </div>

        <PassagePicker
          value={passage}
          onChange={setPassage}
          hebrew={hebrew}
          t={t.passage}
        />

        <div className="space-y-3">
          <span className="text-sm font-medium">{t.rhythm}</span>
          <Segmented
            aria-label={t.rhythm}
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
                className="w-full sm:w-72"
              />
            </label>
          ) : (
            <label className="block space-y-1.5">
              <span className="text-sm text-muted">{t.endDate}</span>
              <TextInput
                type="date"
                value={endDate}
                min={start}
                onChange={(e) => setEndDate(e.target.value)}
                className="sm:w-56"
              />
            </label>
          )}
        </div>

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
          {weekdays.length === 0 && <ErrorLine message={t.noDays} />}
        </div>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">{t.startDate}</span>
          <TextInput
            type="date"
            value={start}
            onChange={(e) => setStartDate(e.target.value || null)}
            className="sm:w-56"
          />
        </label>

        {summary && (
          <p className="rounded-md bg-accent-soft px-3 py-2 text-sm text-accent">
            {summary}
          </p>
        )}

        <ErrorLine message={error} />

        <div className="flex flex-wrap gap-2">
          <Button variant="primary" disabled={!plan || busy} onClick={submit}>
            {t.submit}
          </Button>
          <Button variant="ghost" onClick={() => router.back()}>
            {t.cancel}
          </Button>
        </div>
      </div>
    </>
  );
}
