"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  gregorianToHebrew,
  hebrewYearForGregorian,
  toHebrewMonthKey,
  type HebrewMonthKey,
} from "@repo/hebcal";
import type { AnniversaryType } from "@repo/anniversaries/person";

import { useLanguage } from "@/i18n";
import { Button } from "../Button";
import { Segmented } from "../Segmented";
import { Select } from "../Select";
import {
  gregorianDayOptions,
  gregorianMonthOptions,
  gregorianYearOptions,
  hebrewDayOptions,
  hebrewMonthOptions,
} from "../../home/options";
import {
  addAnniversaryAction,
  getNotifyDefaultsAction,
} from "../../anniversaries/actions";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export type AnniversaryFormTexts = {
  name: string;
  namePlaceholder: string;
  type: string;
  types: { birthday: string; yahrzeit: string };
  hebDate: string;
  calendar: string;
  day: string;
  month: string;
  year: string;
  hebYear: string;
  optional: string;
  years: string;
  sharedEmails: string;
  sharedEmailsPlaceholder: string;
  sharedEmailsHelp: string;
  submit: string;
  submitting: string;
  cancel: string;
  toggle: { hebrew: string; gregorian: string; aria: string };
  notify: string;
  notifyHelp: string;
  notifyWarning: string;
  nameRequired: string;
  emailInvalid: (email: string) => string;
  notConfigured: string;
  noSuchDate: string;
  rateLimited: string;
  error: (message: string) => string;
  months: Record<HebrewMonthKey, string>;
};

export function AnniversaryForm({ t }: { t: AnniversaryFormTexts }) {
  const { locale } = useLanguage();
  const router = useRouter();

  const months = useMemo(() => hebrewMonthOptions(t.months), [t.months]);
  const days = useMemo(() => hebrewDayOptions(locale), [locale]);
  const gregDays = useMemo(() => gregorianDayOptions(), []);
  const gregMonths = useMemo(() => gregorianMonthOptions(locale), [locale]);
  const gregYears = useMemo(() => gregorianYearOptions(), []);

  const [name, setName] = useState("");
  const [type, setType] = useState<AnniversaryType>("birthday");
  const [fromGregorian, setFromGregorian] = useState(false);
  const [day, setDay] = useState("1");
  const [month, setMonth] = useState("Tishrei");
  const [hebYear, setHebYear] = useState("");
  const [gDay, setGDay] = useState("1");
  const [gMonth, setGMonth] = useState("0");
  const [gYear, setGYear] = useState(() => String(new Date().getFullYear()));
  const [years, setYears] = useState("20");
  const [sharedRaw, setSharedRaw] = useState("");
  const [notifyOverrides, setNotifyOverrides] = useState<
    Record<string, boolean>
  >({});
  const [notifyDefaults, setNotifyDefaults] = useState<Record<string, boolean>>(
    {},
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Emails that look valid so far, lowercased + deduped, in typed order.
  const parsedShared = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    for (const raw of sharedRaw.split(",")) {
      const emailAddr = raw.trim().toLowerCase();
      if (emailAddr && EMAIL_RE.test(emailAddr) && !seen.has(emailAddr)) {
        seen.add(emailAddr);
        list.push(emailAddr);
      }
    }
    return list;
  }, [sharedRaw]);

  // Default each newly-typed email to "notify" unless we've already sent
  // them a calendar invite before (they've presumably accepted it by now).
  const fetchedNotifyDefaults = useRef<Set<string>>(new Set());
  useEffect(() => {
    const missing = parsedShared.filter(
      (emailAddr) => !fetchedNotifyDefaults.current.has(emailAddr),
    );
    if (missing.length === 0) return;
    for (const emailAddr of missing) {
      fetchedNotifyDefaults.current.add(emailAddr);
    }
    let cancelled = false;
    getNotifyDefaultsAction(missing).then((result) => {
      if (!cancelled) setNotifyDefaults((prev) => ({ ...prev, ...result }));
    });
    return () => {
      cancelled = true;
    };
  }, [parsedShared]);

  const notifyChecked = (emailAddr: string) =>
    notifyOverrides[emailAddr] ?? notifyDefaults[emailAddr] ?? true;
  const toggleNotify = (emailAddr: string) =>
    setNotifyOverrides((prev) => ({
      ...prev,
      [emailAddr]: !notifyChecked(emailAddr),
    }));

  const yearOptions = [5, 10, 15, 20, 30, 50].map((n) => ({
    key: String(n),
    label: String(n),
  }));

  const converted = useMemo(() => {
    if (!fromGregorian) return null;
    return gregorianToHebrew(Number(gYear), Number(gMonth) + 1, Number(gDay));
  }, [fromGregorian, gYear, gMonth, gDay]);

  const yahrzeit = type === "yahrzeit";
  const tone = yahrzeit ? "yahrzeit" : "birthday";

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError(t.nameRequired);
      return;
    }

    const hebDay = converted ? converted.day : Number(day);
    const hebMonth = converted ? toHebrewMonthKey(converted.month) : month;

    // Hebrew year: derived from the Gregorian date, or the optional field.
    const hebYearValue = fromGregorian
      ? hebrewYearForGregorian(Number(gYear), Number(gMonth) + 1, Number(gDay))
      : hebYear.trim()
        ? Number(hebYear.trim())
        : undefined;

    const shared = sharedRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const badEmail = shared.find((e) => !EMAIL_RE.test(e));
    if (badEmail) {
      setError(t.emailInvalid(badEmail));
      return;
    }
    const notifyEmails = shared.filter((e) => notifyChecked(e.toLowerCase()));

    setPending(true);
    const result = await addAnniversaryAction({
      name: name.trim(),
      type,
      hebDay,
      hebMonth,
      hebYear:
        hebYearValue && Number.isFinite(hebYearValue)
          ? hebYearValue
          : undefined,
      sharedEmails: shared,
      years: Number(years),
      notifyEmails,
      locale,
    });
    setPending(false);

    if (!result.ok) {
      setError(
        result.error === "not-configured" ||
          result.error === "db-not-configured"
          ? t.notConfigured
          : result.error === "no-such-date"
            ? t.noSuchDate
            : result.error === "rate-limited"
              ? t.rateLimited
              : t.error(result.error),
      );
      return;
    }
    router.push("/anniversaries");
  };

  const label =
    "font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-subtle-foreground";
  const input =
    "min-h-[44px] rounded-field border border-border bg-card px-3 text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20";

  return (
    <form onSubmit={submit} className="flex max-w-md flex-col gap-5">
      <label className="flex flex-col gap-1.5">
        <span className={label}>{t.name}</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.namePlaceholder}
          className={`${input} font-display text-base`}
        />
      </label>

      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-1.5">
          <span className={label}>{t.type}</span>
          <Segmented
            aria-label={t.type}
            tone={tone}
            value={type}
            onChange={setType}
            options={[
              { value: "birthday", label: t.types.birthday },
              { value: "yahrzeit", label: t.types.yahrzeit },
            ]}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className={label}>{t.calendar}</span>
          <Segmented
            aria-label={t.toggle.aria}
            value={fromGregorian ? "gregorian" : "hebrew"}
            onChange={(v) => setFromGregorian(v === "gregorian")}
            options={[
              { value: "hebrew", label: t.toggle.hebrew },
              { value: "gregorian", label: t.toggle.gregorian },
            ]}
          />
        </div>
      </div>

      {fromGregorian ? (
        <>
          <div className="flex flex-wrap gap-3">
            <Select
              label={t.day}
              options={gregDays}
              value={gDay}
              onChange={setGDay}
            />
            <Select
              label={t.month}
              options={gregMonths}
              value={gMonth}
              onChange={setGMonth}
            />
            <Select
              label={t.year}
              options={gregYears}
              value={gYear}
              onChange={setGYear}
            />
          </div>
          {converted && (
            <p className="text-sm text-muted-foreground">
              {t.hebDate}: {converted.day}{" "}
              <span dir="ltr">{converted.month}</span>
            </p>
          )}
        </>
      ) : (
        <>
          <div
            className="flex flex-wrap gap-3"
            dir={locale === "he" ? "rtl" : "ltr"}
          >
            <Select
              label={t.day}
              options={days}
              value={day}
              onChange={setDay}
            />
            <Select
              label={t.month}
              options={months}
              value={month}
              onChange={setMonth}
            />
            <label className="flex flex-col gap-1.5">
              <span className={label}>
                {t.hebYear}{" "}
                <span className="normal-case tracking-normal text-subtle-foreground/70">
                  {t.optional}
                </span>
              </span>
              <input
                inputMode="numeric"
                value={hebYear}
                onChange={(e) =>
                  setHebYear(e.target.value.replace(/[^0-9]/g, ""))
                }
                placeholder="5754"
                className={`${input} w-32`}
                dir="ltr"
              />
            </label>
          </div>
        </>
      )}

      <Select
        label={t.years}
        options={yearOptions}
        value={years}
        onChange={setYears}
      />

      <label className="flex flex-col gap-1.5">
        <span className={label}>
          {t.sharedEmails}{" "}
          <span className="normal-case tracking-normal text-subtle-foreground/70">
            {t.optional}
          </span>
        </span>
        <input
          value={sharedRaw}
          onChange={(e) => setSharedRaw(e.target.value)}
          placeholder={t.sharedEmailsPlaceholder}
          className={input}
          dir="ltr"
        />
        <span className="text-xs text-subtle-foreground">
          {t.sharedEmailsHelp}
        </span>
      </label>

      {parsedShared.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className={label}>{t.notify}</span>
          <span className="text-xs text-subtle-foreground">{t.notifyHelp}</span>
          <div className="flex flex-col gap-1.5 pt-1">
            {parsedShared.map((emailAddr) => (
              <label key={emailAddr} className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={notifyChecked(emailAddr)}
                  onChange={() => toggleNotify(emailAddr)}
                  className="h-4 w-4 shrink-0 accent-primary"
                />
                <span className="text-sm" dir="ltr">
                  {emailAddr}
                </span>
              </label>
            ))}
          </div>
          {parsedShared.some((emailAddr) => !notifyChecked(emailAddr)) && (
            <p className="rounded-field border border-border bg-sunken px-3 py-2 text-xs text-muted-foreground">
              {t.notifyWarning}
            </p>
          )}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center gap-2 pt-1">
        <Button
          type="submit"
          disabled={pending}
          className={yahrzeit ? "bg-yahrzeit" : undefined}
        >
          {pending ? t.submitting : t.submit}
        </Button>
        <Link
          href="/anniversaries"
          className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          {t.cancel}
        </Link>
      </div>
    </form>
  );
}
