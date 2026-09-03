"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { gregorianToHebrew, toHebrewMonthKey } from "@repo/hebcal";

import { useI18n } from "@/i18n/context";
import { Button } from "../Button";
import { Select } from "../Select";
import { Switch } from "../Switch";
import {
  gregorianDayOptions,
  gregorianMonthOptions,
  gregorianYearOptions,
  hebrewMonthOptions,
} from "../../home/options";
import { createAnniversaryAction } from "../../anniversaries/actions";

export function AnniversaryForm() {
  const { t, locale } = useI18n();
  const router = useRouter();

  const months = useMemo(() => hebrewMonthOptions(t), [t]);
  const gregDays = useMemo(() => gregorianDayOptions(), []);
  const gregMonths = useMemo(() => gregorianMonthOptions(locale), [locale]);
  const gregYears = useMemo(() => gregorianYearOptions(), []);

  const [name, setName] = useState("");
  const [fromGregorian, setFromGregorian] = useState(false);
  const [day, setDay] = useState("1");
  const [month, setMonth] = useState("Tishrei");
  const [gDay, setGDay] = useState("1");
  const [gMonth, setGMonth] = useState("0");
  const [gYear, setGYear] = useState(() => String(new Date().getFullYear()));
  const [years, setYears] = useState("10");
  const [sharedRaw, setSharedRaw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const dayOptions = Array.from({ length: 30 }, (_, i) => ({
    key: String(i + 1),
    label: String(i + 1),
  }));
  const yearOptions = [5, 10, 15, 20, 30, 50].map((n) => ({
    key: String(n),
    label: String(n),
  }));

  // Derived Hebrew date when the user is entering a Gregorian birth date.
  const converted = useMemo(() => {
    if (!fromGregorian) return null;
    return gregorianToHebrew(Number(gYear), Number(gMonth) + 1, Number(gDay));
  }, [fromGregorian, gYear, gMonth, gDay]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError(t.anniversary.validation.nameRequired);
      return;
    }

    const hebDay = converted ? converted.day : Number(day);
    const hebMonth = converted ? toHebrewMonthKey(converted.month) : month;
    if (!hebDay || !hebMonth) {
      setError(t.anniversary.validation.nameRequired);
      return;
    }

    const shared = sharedRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const badEmail = shared.find(
      (e) => !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e),
    );
    if (badEmail) {
      setError(t.anniversary.validation.emailInvalid(badEmail));
      return;
    }

    setPending(true);
    const result = await createAnniversaryAction({
      name: name.trim(),
      hebDay,
      hebMonth,
      shared,
      years: Number(years),
      locale,
    });
    setPending(false);

    if (!result.ok) {
      setError(
        result.error === "not-connected"
          ? t.calendar.connect.reconnect
          : t.anniversary.toast.error(result.error),
      );
      return;
    }
    router.push("/anniversaries");
  };

  return (
    <form onSubmit={submit} className="flex max-w-md flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">{t.anniversary.form.name}</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.anniversary.form.namePlaceholder}
          className="rounded-lg border border-foreground/20 bg-background px-3 py-2 outline-none focus:border-foreground/50"
        />
      </label>

      <div className="flex items-center gap-3 text-sm">
        <span className={fromGregorian ? "opacity-50" : "font-medium"}>
          {t.home.hebrew}
        </span>
        <Switch
          checked={fromGregorian}
          onChange={setFromGregorian}
          aria-label={t.home.toggleCalendar}
        />
        <span className={fromGregorian ? "font-medium" : "opacity-50"}>
          {t.home.gregorian}
        </span>
      </div>

      {fromGregorian ? (
        <>
          <div className="flex flex-wrap gap-4">
            <Select
              label={t.anniversary.form.day}
              options={gregDays}
              value={gDay}
              onChange={setGDay}
            />
            <Select
              label={t.anniversary.form.month}
              options={gregMonths}
              value={gMonth}
              onChange={setGMonth}
            />
            <Select
              label={t.gregorianForm.year}
              options={gregYears}
              value={gYear}
              onChange={setGYear}
            />
          </div>
          {converted && (
            <p className="text-sm opacity-70">
              {t.anniversary.form.hebDate}: {converted.day}{" "}
              <span dir="ltr">{converted.month}</span>
            </p>
          )}
        </>
      ) : (
        <div
          className="flex flex-wrap gap-4"
          dir={locale === "he" ? "rtl" : "ltr"}
        >
          <Select
            label={t.anniversary.form.day}
            options={dayOptions}
            value={day}
            onChange={setDay}
          />
          <Select
            label={t.anniversary.form.month}
            options={months}
            value={month}
            onChange={setMonth}
          />
        </div>
      )}

      <Select
        label={t.anniversary.form.years}
        options={yearOptions}
        value={years}
        onChange={setYears}
      />

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">{t.anniversary.form.sharedEmails}</span>
        <input
          value={sharedRaw}
          onChange={(e) => setSharedRaw(e.target.value)}
          placeholder={t.anniversary.form.sharedEmailsPlaceholder}
          className="rounded-lg border border-foreground/20 bg-background px-3 py-2 outline-none focus:border-foreground/50"
        />
        <span className="text-xs opacity-60">
          {t.anniversary.form.sharedEmailsHelp}
        </span>
      </label>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? t.anniversary.form.submitting : t.anniversary.form.submit}
      </Button>
    </form>
  );
}
