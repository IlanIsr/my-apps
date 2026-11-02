"use client";

/**
 * Entering / editing a receipt: store, date, the total printed on it, then one
 * row per line (barcode, label, piece / kg, quantity, unit price, discount).
 * The running sum is compared with the printed total as you type. A known
 * barcode or product name fills the rest of the line (last price at this store).
 * Barcodes can be scanned with the camera (one line, or one line per code in
 * a row), and a photo of the receipt can pre-fill the whole form (read by
 * Claude — always checked before saving).
 * Its expense goes in Groceries unless another category is picked (paper,
 * tools… bought at a store but not food).
 */

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

import { readReceiptPhotoAction, saveReceiptAction } from "@/app/actions";
import {
  categoryLabel,
  GROCERIES_KEY,
  METHOD_ICON,
  METHODS,
  type Category,
  type Method,
} from "@/lib/expense-logic";
import {
  centsToInput,
  checkTotal,
  formatMoney,
  lineTotal,
  normalizeName,
  parseMoney,
  parseQuantity,
  quantityToInput,
  today,
  type LineInput,
  type Product,
  type Receipt,
  type Store,
  type Unit,
} from "@/lib/grocery-logic";
import { LOCALE_TAG, useLanguage, useTranslations } from "@/i18n";

import { BarcodeScanner } from "./BarcodeScanner";
import { Button } from "./Button";
import { Combo } from "./Combo";
import { ErrorLine, Field, PageHeader, fill, type ErrorTexts } from "./common";
import { Segmented } from "./Segmented";
import { Select } from "./Select";
import { TextInput } from "./TextInput";

export type ReceiptFormTexts = {
  newTitle: string;
  editTitle: string;
  store: string;
  storePlaceholder: string;
  date: string;
  declaredTotal: string;
  note: string;
  lines: string;
  barcode: string;
  label: string;
  unit: { unit: string; kg: string };
  quantity: string;
  weight: string;
  unitPrice: string;
  pricePerKg: string;
  discount: string;
  lineTotal: string;
  removeLine: string;
  addLine: string;
  sum: string;
  printed: string;
  matches: string;
  /** `{diff}` = signed difference. */
  mismatch: string;
  noDeclared: string;
  /** The printed total is the sum rounded (cash). */
  rounded: string;
  method: string;
  category: string;
  save: string;
  cancel: string;
  needStore: string;
  /** `{n}` = 1-based line number. */
  badLine: string;
  scan: string;
  scanContinuous: string;
  photo: string;
  gallery: string;
  reading: string;
  /** `{n}` lines read. */
  photoRead: string;
};

type Row = {
  key: number;
  barcode: string;
  label: string;
  unit: Unit;
  quantity: string;
  price: string;
  discount: string;
};

/** `productId → storeId → listed unit price`. */
export type LastPrices = Record<string, Record<string, number>>;

let nextKey = 0;
const emptyRow = (): Row => ({
  key: nextKey++,
  barcode: "",
  label: "",
  unit: "unit",
  quantity: "1",
  price: "",
  discount: "",
});

const isBlank = (row: Row) =>
  !row.barcode.trim() && !row.label.trim() && !row.price.trim();

/** Always one blank row at the end to type into. */
const keepBlank = (rows: Row[]) =>
  rows.length && isBlank(rows.at(-1)!) ? rows : [...rows, emptyRow()];

const toRow = (line: LineInput): Row => ({
  key: nextKey++,
  barcode: line.barcode ?? "",
  label: line.label,
  unit: line.unit,
  quantity: quantityToInput(line.quantityMilli),
  price: centsToInput(line.unitPrice),
  discount: line.discount ? centsToInput(line.discount) : "",
});

/** A photo → a JPEG data URL, at most 2000 px on its long side. */
async function shrink(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 2000 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.85);
}

/** The row as a line, or `null` when it isn't valid. */
function toLine(row: Row): LineInput | null {
  const quantityMilli = parseQuantity(row.quantity);
  const unitPrice = parseMoney(row.price);
  const discount = row.discount.trim() ? parseMoney(row.discount) : 0;
  if (!row.label.trim() || !quantityMilli || unitPrice === null) return null;
  if (discount === null) return null;
  return {
    barcode: row.barcode.trim() || null,
    label: row.label.trim(),
    unit: row.unit,
    quantityMilli,
    unitPrice,
    discount,
  };
}

export function ReceiptFormView({
  receipt,
  stores,
  products,
  lastPrices,
  categories,
}: {
  receipt: Receipt | null;
  stores: Store[];
  products: Product[];
  lastPrices: LastPrices;
  categories: Category[];
}) {
  const messages = useTranslations();
  const t = messages.receiptForm;
  const errors: ErrorTexts = messages.errors;
  const tag = LOCALE_TAG[useLanguage().locale];
  const router = useRouter();

  const [storeName, setStoreName] = useState(receipt?.storeName ?? "");
  const [date, setDate] = useState(receipt?.date ?? today());
  const [declared, setDeclared] = useState(
    receipt?.declaredTotal != null ? centsToInput(receipt.declaredTotal) : "",
  );
  const [note, setNote] = useState(receipt?.note ?? "");
  const [method, setMethod] = useState<Method>(receipt?.method ?? "cash");
  const [categoryId, setCategoryId] = useState(
    receipt?.categoryId ??
      categories.find((c) => c.key === GROCERIES_KEY)?.id ??
      null,
  );
  const [rows, setRows] = useState<Row[]>(() =>
    receipt ? [...receipt.lines.map(toRow), emptyRow()] : [emptyRow()],
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  /** The row a single scan fills, or every new code in a row. */
  const [scanning, setScanning] = useState<number | "continuous" | null>(null);
  const [reading, setReading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const photoInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);

  const storeId = stores.find(
    (s) => normalizeName(s.name) === normalizeName(storeName),
  )?.id;
  const byBarcode = useMemo(
    () =>
      new Map(products.filter((p) => p.barcode).map((p) => [p.barcode!, p])),
    [products],
  );
  const productOptions = useMemo(
    () => products.map((p) => ({ key: p.id, label: p.name })),
    [products],
  );

  const update = (key: number, patch: Partial<Row>) =>
    setRows((current) =>
      keepBlank(current.map((r) => (r.key === key ? { ...r, ...patch } : r))),
    );

  /** What a known product fills in a row (keeps what was already typed). */
  const fromProduct = (row: Row, product: Product): Partial<Row> => {
    const last = storeId ? lastPrices[product.id]?.[storeId] : undefined;
    return {
      label: row.label.trim() ? row.label : product.name,
      barcode: product.barcode ?? row.barcode,
      unit: product.unit,
      price:
        row.price.trim() || last === undefined ? row.price : centsToInput(last),
    };
  };
  const fillFrom = (row: Row, product: Product) =>
    update(row.key, fromProduct(row, product));

  /** The row with this barcode, filled when the product is known. */
  const withBarcode = (row: Row, code: string): Row => {
    const next = { ...row, barcode: code };
    const product = byBarcode.get(code.trim());
    return product ? { ...next, ...fromProduct(next, product) } : next;
  };

  /** `false` when a scan in a row reads a code already on the receipt. */
  function scanned(code: string): boolean {
    const target = scanning;
    // Scanning in a row: a code already there is the same item read twice —
    // its quantity is typed on its line, not added as a new one.
    if (
      target === "continuous" &&
      rows.some((r) => r.barcode.trim() === code.trim())
    ) {
      return false;
    }
    setRows((current) => {
      if (target !== "continuous") {
        return keepBlank(
          current.map((r) => (r.key === target ? withBarcode(r, code) : r)),
        );
      }
      // Each code goes on the blank last row (a new line per code).
      const last = current.at(-1)!;
      return keepBlank([...current.slice(0, -1), withBarcode(last, code)]);
    });
    return true;
  }

  const pickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void readPhoto(file);
    e.target.value = "";
  };

  async function readPhoto(file: File) {
    setReading(true);
    setError(null);
    setNotice(null);
    let result;
    try {
      result = await readReceiptPhotoAction(await shrink(file));
    } catch (e) {
      console.error(e);
      result = { ok: false, error: "photo-unreadable" } as const;
    }
    setReading(false);
    if (!result.ok) return setError(errors[result.error]);
    const draft = result.data;
    if (draft.storeName && !storeName.trim()) setStoreName(draft.storeName);
    if (draft.date) setDate(draft.date);
    if (draft.declaredTotal !== null && !declared.trim()) {
      setDeclared(centsToInput(draft.declaredTotal));
    }
    setRows((current) =>
      keepBlank([
        ...current.filter((r) => !isBlank(r)),
        ...draft.lines.map(toRow),
      ]),
    );
    setNotice(fill(t.photoRead, { n: draft.lines.length }));
  }

  const filled = rows.filter((r) => !isBlank(r));
  const lines = filled.map(toLine);
  const sum = lines.reduce((s, l) => s + (l ? lineTotal(l) : 0), 0);
  const declaredCents = declared.trim() ? parseMoney(declared) : null;
  const diff = declaredCents === null ? null : sum - declaredCents;
  const check = checkTotal(sum, declaredCents, method);

  async function save() {
    setError(null);
    if (!storeName.trim()) return setError(t.needStore);
    const bad = lines.findIndex((l) => l === null);
    if (bad !== -1) return setError(fill(t.badLine, { n: bad + 1 }));
    setSaving(true);
    const result = await saveReceiptAction(receipt?.id ?? null, {
      storeName,
      date,
      declaredTotal: declaredCents,
      note,
      method,
      categoryId,
      lines,
    });
    setSaving(false);
    if (!result.ok) return setError(errors[result.error]);
    router.push(`/receipts/${result.data}`);
  }

  return (
    <div className="pb-28">
      <PageHeader title={receipt ? t.editTitle : t.newTitle}>
        <Button onClick={() => cameraInput.current?.click()} disabled={reading}>
          📸 {reading ? t.reading : t.photo}
        </Button>
        <Button
          variant="ghost"
          onClick={() => photoInput.current?.click()}
          disabled={reading}
        >
          🖼️ {t.gallery}
        </Button>
      </PageHeader>
      {/* The native pickers, driven by the buttons: the camera straight away,
          or an existing picture. */}
      <input
        ref={cameraInput}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={pickPhoto}
      />
      <input
        ref={photoInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={pickPhoto}
      />
      {notice && (
        <p className="mb-4 rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent">
          {notice}
        </p>
      )}

      <section className="card mb-6 grid gap-3 p-4 sm:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-xs font-medium text-muted">{t.store}</span>
          <Combo
            aria-label={t.store}
            value={storeName}
            onChange={setStoreName}
            options={stores.map((s) => ({ key: s.id, label: s.name }))}
            placeholder={t.storePlaceholder}
          />
        </div>
        <Field label={t.date}>
          <TextInput
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </Field>
        <Field label={t.declaredTotal}>
          <TextInput
            inputMode="decimal"
            className="num"
            value={declared}
            onChange={(e) => setDeclared(e.target.value)}
            placeholder="0,00"
          />
        </Field>
      </section>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg">{t.lines}</h2>
        <Button size="sm" onClick={() => setScanning("continuous")}>
          📷 {t.scanContinuous}
        </Button>
      </div>
      <ol className="flex flex-col gap-3">
        {rows.map((row, index) => {
          const line = isBlank(row) ? null : toLine(row);
          const invalid = !isBlank(row) && line === null;
          return (
            <li
              key={row.key}
              className={`card grid grid-cols-6 gap-2 p-3 ${
                invalid ? "border-danger" : ""
              } ${isBlank(row) ? "opacity-70" : ""}`}
            >
              <div className="col-span-6 flex items-center gap-2 sm:col-span-2">
                <span className="num w-6 shrink-0 text-xs text-muted">
                  {index + 1}
                </span>
                <TextInput
                  aria-label={t.barcode}
                  placeholder={t.barcode}
                  inputMode="numeric"
                  className="num"
                  value={row.barcode}
                  onChange={(e) => {
                    const code = e.target.value;
                    update(row.key, { barcode: code });
                    const product = byBarcode.get(code.trim());
                    if (product) fillFrom({ ...row, barcode: code }, product);
                  }}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={t.scan}
                  onClick={() => setScanning(row.key)}
                >
                  📷
                </Button>
              </div>
              <div className="col-span-6 sm:col-span-4">
                <Combo
                  aria-label={t.label}
                  placeholder={t.label}
                  value={row.label}
                  onChange={(label) => update(row.key, { label })}
                  options={productOptions}
                  onPick={(id) => {
                    const product = products.find((p) => p.id === id);
                    if (product) fillFrom({ ...row, label: "" }, product);
                  }}
                />
              </div>
              <div className="col-span-6 sm:col-span-2">
                <Segmented
                  aria-label={t.unit.unit}
                  options={[
                    { value: "unit", label: t.unit.unit },
                    { value: "kg", label: t.unit.kg },
                  ]}
                  value={row.unit}
                  onChange={(unit) =>
                    update(row.key, {
                      unit,
                      quantity:
                        unit === "unit" && !row.quantity.trim()
                          ? "1"
                          : row.quantity,
                    })
                  }
                />
              </div>
              <Field
                label={row.unit === "kg" ? t.weight : t.quantity}
                className="col-span-2 sm:col-span-1"
              >
                <TextInput
                  inputMode="decimal"
                  className="num"
                  value={row.quantity}
                  onChange={(e) =>
                    update(row.key, { quantity: e.target.value })
                  }
                />
              </Field>
              <Field
                label={row.unit === "kg" ? t.pricePerKg : t.unitPrice}
                className="col-span-2 sm:col-span-1"
              >
                <TextInput
                  inputMode="decimal"
                  className="num"
                  value={row.price}
                  placeholder="0,00"
                  onChange={(e) => update(row.key, { price: e.target.value })}
                />
              </Field>
              <Field label={t.discount} className="col-span-2 sm:col-span-1">
                <TextInput
                  inputMode="decimal"
                  className="num"
                  value={row.discount}
                  placeholder="0,00"
                  onChange={(e) =>
                    update(row.key, { discount: e.target.value })
                  }
                />
              </Field>
              <div className="col-span-6 flex items-end justify-between gap-2 sm:col-span-1 sm:flex-col sm:items-end">
                <span className="num text-sm font-medium">
                  {line ? formatMoney(lineTotal(line), tag) : "—"}
                </span>
                {!isBlank(row) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={t.removeLine}
                    onClick={() =>
                      setRows((current) =>
                        current.filter((r) => r.key !== row.key),
                      )
                    }
                  >
                    ✕
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted">{t.method}</span>
          <Segmented
            aria-label={t.method}
            options={METHODS.map((m) => ({
              value: m,
              label: `${METHOD_ICON[m]} ${messages.methods[m]}`,
            }))}
            value={method}
            onChange={setMethod}
          />
        </div>
        <div className="flex min-w-48 flex-1 flex-col gap-1 sm:max-w-64">
          <span className="text-xs font-medium text-muted">{t.category}</span>
          <Select
            aria-label={t.category}
            className="w-full"
            value={categoryId ?? ""}
            onChange={setCategoryId}
            options={categories
              .filter((c) => !c.archived || c.id === categoryId)
              .map((c) => ({
                key: c.id,
                label: `${c.icon} ${categoryLabel(c, messages.categoryNames)}`,
              }))}
          />
        </div>
      </div>

      <Field label={t.note} className="mt-4">
        <TextInput value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>

      {scanning !== null && (
        <BarcodeScanner
          continuous={scanning === "continuous"}
          onDetect={scanned}
          onClose={() => setScanning(null)}
          t={messages.scanner}
        />
      )}

      <div className="fixed inset-x-0 bottom-0 border-t border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <div className="flex flex-col">
            <span className="eyebrow">{t.sum}</span>
            <span className="num text-xl font-semibold">
              {formatMoney(sum, tag)}
            </span>
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="eyebrow">{t.printed}</span>
            {diff === null ? (
              <span className="text-sm text-muted">{t.noDeclared}</span>
            ) : check === "rounded" ? (
              <span className="text-sm font-medium text-accent">
                ✓ {t.rounded}
              </span>
            ) : diff === 0 ? (
              <span className="text-sm font-medium text-accent">
                ✓ {t.matches}
              </span>
            ) : (
              <span className="text-sm font-medium text-danger">
                {fill(t.mismatch, {
                  diff: `${diff > 0 ? "+" : ""}${formatMoney(diff, tag)}`,
                })}
              </span>
            )}
          </div>
          <div className="ms-auto flex flex-col items-end gap-1">
            <ErrorLine message={error} />
            <div className="flex gap-2">
              <Button onClick={() => router.back()} disabled={saving}>
                {t.cancel}
              </Button>
              <Button variant="primary" onClick={save} disabled={saving}>
                {t.save}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
