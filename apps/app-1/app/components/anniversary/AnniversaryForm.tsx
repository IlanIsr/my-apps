"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useI18n } from "@/i18n/context";
import { Button } from "../Button";
import { Select } from "../Select";
import { hebrewMonthOptions } from "../../home/options";
import { createAnniversaryAction } from "../../anniversaries/actions";

export function AnniversaryForm() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const months = useMemo(() => hebrewMonthOptions(t), [t]);

  const [name, setName] = useState("");
  const [day, setDay] = useState("1");
  const [month, setMonth] = useState("Tishrei");
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

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError(t.anniversary.validation.nameRequired);
      return;
    }
    const shared = sharedRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const badEmail = shared.find((e) => !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e));
    if (badEmail) {
      setError(t.anniversary.validation.emailInvalid(badEmail));
      return;
    }

    setPending(true);
    const result = await createAnniversaryAction({
      name: name.trim(),
      hebDay: Number(day),
      hebMonth: month,
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

      <div className="flex flex-wrap gap-4" dir={locale === "he" ? "rtl" : "ltr"}>
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
