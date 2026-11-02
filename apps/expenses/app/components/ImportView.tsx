"use client";

/**
 * Importing a card statement (CSV or Excel), parsed in the browser: pick the
 * date / merchant / amount columns (guessed from the headers), review each
 * line — its category comes from what that merchant was filed under before;
 * lines matching an expense already entered (same day, same amount — e.g. a
 * receipt) or already imported are unticked — then import. Lines come in as
 * card payments.
 */

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

import { importTransactionsAction } from "@/app/actions";
import {
  categoryLabel,
  findHeaderRow,
  findMatch,
  guessColumn,
  importKeys,
  merchantKey,
  parseCsv,
  parseStatementAmount,
  parseStatementDate,
  type Category,
  type CategoryRules,
  type ImportRow,
  type Transaction,
} from "@/lib/expense-logic";
import { formatDay, formatMoney } from "@/lib/grocery-logic";
import { LOCALE_TAG, useLanguage, useTranslations } from "@/i18n";

import { Button } from "./Button";
import { Checkbox } from "./Checkbox";
import { ErrorLine, PageHeader, fill } from "./common";
import { Select } from "./Select";

export type ImportTexts = {
  title: string;
  description: string;
  pickFile: string;
  unreadable: string;
  columns: string;
  date: string;
  merchant: string;
  amount: string;
  none: string;
  /** `{n}` lines read, `{skipped}` unreadable. */
  summary: string;
  alreadyImported: string;
  /** `{what}` = the matching expense. */
  matches: string;
  uncategorized: string;
  /** `{n}`. */
  importButton: string;
  /** `{n}`. */
  done: string;
};

type Line = ImportRow & {
  key: string;
  include: boolean;
  categoryId: string | null;
  note: string | null;
};

export function ImportView({
  transactions,
  categories,
  rules,
}: {
  transactions: Transaction[];
  categories: Category[];
  rules: CategoryRules;
}) {
  const messages = useTranslations();
  const t = messages.import;
  const tag = LOCALE_TAG[useLanguage().locale];
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);

  const [cells, setCells] = useState<unknown[][] | null>(null);
  const [headerRow, setHeaderRow] = useState(0);
  const [cols, setCols] = useState({ date: -1, merchant: -1, amount: -1 });
  const [overrides, setOverrides] = useState<
    Record<string, Partial<Pick<Line, "include" | "categoryId">>>
  >({});
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function readFile(file: File) {
    setError(null);
    setMessage(null);
    setOverrides({});
    try {
      let rows: unknown[][];
      if (/\.xlsx$/i.test(file.name)) {
        const { readSheet } = await import("read-excel-file/browser");
        rows = (await readSheet(file)) as unknown[][];
      } else {
        rows = parseCsv(await file.text());
      }
      const header = findHeaderRow(rows);
      const headers = (rows[header] ?? []).map((c) =>
        typeof c === "string" ? c : "",
      );
      setCells(rows);
      setHeaderRow(header);
      setCols({
        date: guessColumn(headers, "date"),
        merchant: guessColumn(headers, "merchant"),
        amount: guessColumn(headers, "amount"),
      });
    } catch (e) {
      console.error(e);
      setCells(null);
      setError(t.unreadable);
    }
  }

  const headers = (cells?.[headerRow] ?? []).map((c, i) =>
    typeof c === "string" && c.trim() ? c : `#${i + 1}`,
  );

  const { lines, skipped } = useMemo(() => {
    if (!cells || cols.date < 0 || cols.amount < 0) {
      return { lines: [] as Line[], skipped: 0 };
    }
    const parsed: ImportRow[] = [];
    let skipped = 0;
    for (const row of cells.slice(headerRow + 1)) {
      const date = parseStatementDate(row[cols.date]);
      const amount = parseStatementAmount(row[cols.amount]);
      const merchant =
        cols.merchant >= 0 ? String(row[cols.merchant] ?? "").trim() : "";
      if (!date || !amount) {
        skipped++;
        continue;
      }
      parsed.push({ date, amount, merchant: (merchant || "?").slice(0, 80) });
    }
    const keys = importKeys(parsed);
    const imported = new Set(transactions.map((x) => x.importKey));
    const manual = transactions.filter((x) => !x.importKey);
    return {
      skipped,
      lines: parsed.map((row, i): Line => {
        const key = keys[i]!;
        const match = findMatch(row, manual);
        const already = imported.has(key);
        return {
          ...row,
          key,
          include: !already && !match,
          categoryId: rules[merchantKey(row.merchant)] ?? null,
          note: already
            ? t.alreadyImported
            : match
              ? fill(t.matches, {
                  what: `${match.merchant ?? ""} ${formatMoney(match.amount, tag)}`,
                })
              : null,
        };
      }),
    };
  }, [cells, headerRow, cols, transactions, rules, t, tag]);

  const final = lines.map((l) => ({ ...l, ...overrides[l.key] }));
  const chosen = final.filter((l) => l.include);

  async function run() {
    setBusy(true);
    setError(null);
    const result = await importTransactionsAction(
      chosen.map((l) => ({
        date: l.date,
        amount: l.amount,
        merchant: l.merchant,
        categoryId: l.categoryId,
        importKey: l.key,
      })),
    );
    setBusy(false);
    if (!result.ok) return setError(messages.errors[result.error]);
    setMessage(fill(t.done, { n: result.data }));
    setCells(null);
    router.refresh();
  }

  const columnSelect = (field: keyof typeof cols) => (
    <Select
      aria-label={t[field]}
      className="w-full"
      value={String(cols[field])}
      onChange={(v) => setCols((c) => ({ ...c, [field]: Number(v) }))}
      options={[
        { key: "-1", label: t.none },
        ...headers.map((h, i) => ({ key: String(i), label: h })),
      ]}
    />
  );

  return (
    <>
      <PageHeader title={t.title} />
      <p className="mb-4 text-sm text-muted">{t.description}</p>

      {/* The native file picker, driven by the button below. */}
      <input
        ref={fileInput}
        type="file"
        accept=".csv,.xlsx,text/csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void readFile(file);
          e.target.value = "";
        }}
      />
      <Button variant="primary" onClick={() => fileInput.current?.click()}>
        {t.pickFile}
      </Button>
      <div className="mt-2">
        <ErrorLine message={error} />
        {message && (
          <p className="text-sm font-medium text-accent">{message}</p>
        )}
      </div>

      {cells && (
        <>
          <section className="card mt-6 grid gap-3 p-4 sm:grid-cols-3">
            <h2 className="text-lg sm:col-span-3">{t.columns}</h2>
            {(["date", "merchant", "amount"] as const).map((field) => (
              <div key={field} className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted">
                  {t[field]}
                </span>
                {columnSelect(field)}
              </div>
            ))}
          </section>

          <p className="mt-4 mb-2 text-sm text-muted">
            {fill(t.summary, { n: lines.length, skipped })}
          </p>
          <ul className="card divide-y divide-line">
            {final.map((l) => (
              <li
                key={l.key}
                className={`flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-sm ${
                  l.include ? "" : "opacity-60"
                }`}
              >
                <Checkbox
                  checked={l.include}
                  onChange={(include) =>
                    setOverrides((o) => ({
                      ...o,
                      [l.key]: { ...o[l.key], include },
                    }))
                  }
                  className="flex min-w-0 flex-1 items-center gap-2"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">
                      {l.merchant}
                    </span>
                    <span className="block text-xs text-muted">
                      {formatDay(l.date, tag)}
                      {l.note && ` · ${l.note}`}
                    </span>
                  </span>
                </Checkbox>
                <Select
                  aria-label={t.uncategorized}
                  className="w-40"
                  value={l.categoryId ?? "none"}
                  onChange={(v) =>
                    setOverrides((o) => ({
                      ...o,
                      [l.key]: {
                        ...o[l.key],
                        categoryId: v === "none" ? null : v,
                      },
                    }))
                  }
                  options={[
                    { key: "none", label: t.uncategorized },
                    ...categories
                      .filter((c) => !c.archived)
                      .map((c) => ({
                        key: c.id,
                        label: `${c.icon} ${categoryLabel(c, messages.categoryNames)}`,
                      })),
                  ]}
                />
                <span className="num w-24 text-end font-semibold">
                  {formatMoney(l.amount, tag)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-end">
            <Button
              variant="primary"
              disabled={busy || chosen.length === 0}
              onClick={run}
            >
              {fill(t.importButton, { n: chosen.length })}
            </Button>
          </div>
        </>
      )}
    </>
  );
}
