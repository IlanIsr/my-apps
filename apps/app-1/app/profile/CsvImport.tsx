"use client";

/**
 * Profile → "Import a CSV": reads a Hebcal export (`lib/hebcal-csv.ts`, parsed
 * in the browser), shows one line per person to review (include it? birthday
 * or azkara?), then adds them one at a time through `addAnniversaryAction` —
 * same path as the "Add" form, so an existing anniversary is joined, not
 * duplicated. Stops on a Google Calendar rate limit; the rest can be retried.
 */

import Link from "next/link";
import { useRef, useState } from "react";

import type { AnniversaryType } from "@repo/anniversaries/person";
import type { HebrewMonthKey } from "@repo/hebcal";
import { useLanguage } from "@/i18n";
import { parseHebcalCsv, type CsvAnniversary } from "@/lib/hebcal-csv";
import { addAnniversaryAction } from "../anniversaries/actions";
import { Button } from "../components/Button";
import { Checkbox } from "../components/Checkbox";
import { Select } from "../components/Select";

/** Text for {@link CsvImport}. */
export type CsvImportTexts = {
  title: string;
  intro: string;
  /** "Another format?" — then the {@link contact} link, then {@link contactAfter}. */
  otherFormat: string;
  contact: string;
  contactAfter: string;
  choose: string;
  nothingFound: string;
  found: (people: number, skipped: number) => string;
  type: string;
  types: { birthday: string; yahrzeit: string };
  dates: (n: number) => string;
  year: (y: number) => string;
  import: (n: number) => string;
  importing: (done: number, total: number) => string;
  status: { created: string; joined: string; failed: string };
  rateLimited: string;
  done: (created: number, joined: number, failed: number) => string;
  months: Record<HebrewMonthKey, string>;
};

type Status = "created" | "joined" | "failed";
type Line = CsvAnniversary & { include: boolean; status?: Status };

const YEARS = 20;

export function CsvImport({ t }: { t: CsvImportTexts }) {
  const { locale, minhag } = useLanguage();
  const input = useRef<HTMLInputElement>(null);
  const [lines, setLines] = useState<Line[] | null>(null);
  const [skipped, setSkipped] = useState(0);
  const [progress, setProgress] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const read = async (file: File | undefined) => {
    if (!file) return;
    const parsed = parseHebcalCsv(await file.text());
    setLines(parsed.anniversaries.map((a) => ({ ...a, include: true })));
    setSkipped(parsed.skipped);
    setMessage(null);
    if (input.current) input.current.value = "";
  };

  const update = (i: number, patch: Partial<Line>) =>
    setLines((prev) =>
      prev ? prev.map((l, j) => (j === i ? { ...l, ...patch } : l)) : prev,
    );

  const todo = (lines ?? []).filter((l) => l.include && !l.status);

  const run = async () => {
    if (!lines) return;
    setMessage(null);
    let done = 0;
    const counts = { created: 0, joined: 0, failed: 0 };
    for (const [i, line] of lines.entries()) {
      if (!line.include || line.status) continue;
      setProgress(done);
      const result = await addAnniversaryAction({
        name: line.name,
        type: line.type,
        hebDay: line.hebDay,
        hebMonth: line.hebMonth,
        hebYear: line.hebYear,
        // A single-Adar line keeps what the file shows; else the profile's.
        minhag: line.hebMonth === "Adar" ? line.minhag : (minhag ?? "sephardi"),
        years: YEARS,
        locale,
      });
      done++;
      if (!result.ok && result.error === "rate-limited") {
        setMessage(t.rateLimited);
        break;
      }
      const status: Status = !result.ok
        ? "failed"
        : result.data.joined
          ? "joined"
          : "created";
      counts[status]++;
      update(i, { status });
    }
    setProgress(null);
    setMessage(
      (m) => m ?? t.done(counts.created, counts.joined, counts.failed),
    );
  };

  const busy = progress !== null;

  return (
    <section className="flex flex-col gap-3 rounded-card border border-border bg-card p-5">
      <span className="font-mono text-[10.5px] font-medium tracking-[0.12em] text-subtle-foreground uppercase">
        {t.title}
      </span>
      <p className="text-xs text-muted-foreground">{t.intro}</p>
      <p className="text-xs text-muted-foreground">
        {t.otherFormat}{" "}
        <Link href="/contact" className="underline hover:text-foreground">
          {t.contact}
        </Link>
        {t.contactAfter}
      </p>

      {/* No HeroUI file picker — a hidden native input behind our Button. */}
      <input
        ref={input}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => read(e.target.files?.[0])}
      />
      <Button
        variant="outline"
        size="sm"
        className="self-start"
        disabled={busy}
        onClick={() => input.current?.click()}
      >
        {t.choose}
      </Button>

      {lines && !lines.length && (
        <p className="text-sm text-destructive">{t.nothingFound}</p>
      )}

      {lines && lines.length > 0 && (
        <>
          <p className="text-xs text-muted-foreground">
            {t.found(lines.length, skipped)}
          </p>
          <ul className="flex flex-col divide-y divide-hairline rounded-field border border-border">
            {lines.map((line, i) => (
              <li
                key={`${line.name}|${line.type}|${i}`}
                className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2 text-sm"
              >
                <Checkbox
                  checked={line.include}
                  onChange={(include) => update(i, { include })}
                  className="flex min-w-0 flex-1 items-center gap-2.5"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-display">
                      {line.name}
                    </span>
                    <span className="block text-xs text-subtle-foreground">
                      {line.hebDay} {t.months[line.hebMonth]}
                      {line.hebYear ? ` · ${t.year(line.hebYear)}` : ""} ·{" "}
                      {t.dates(line.rows)}
                    </span>
                  </span>
                </Checkbox>
                {line.status ? (
                  <span
                    className={`text-xs ${line.status === "failed" ? "text-destructive" : "text-muted-foreground"}`}
                  >
                    {t.status[line.status]}
                  </span>
                ) : (
                  <Select
                    hideLabel
                    label={t.type}
                    value={line.type}
                    onChange={(type) =>
                      update(i, { type: type as AnniversaryType })
                    }
                    options={[
                      { key: "birthday", label: t.types.birthday },
                      { key: "yahrzeit", label: t.types.yahrzeit },
                    ]}
                    className="w-36"
                  />
                )}
              </li>
            ))}
          </ul>
          <Button
            className="self-start"
            disabled={busy || todo.length === 0}
            onClick={run}
          >
            {busy
              ? t.importing(progress, todo.length + progress)
              : t.import(todo.length)}
          </Button>
        </>
      )}

      {message && <p className="text-xs">{message}</p>}
    </section>
  );
}
