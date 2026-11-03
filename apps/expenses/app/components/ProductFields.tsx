"use client";

/**
 * A product's editable details — name, barcode, piece / kg, shelf, content —
 * shared by its page (edit) and the Products page's "+" (new product).
 */

import {
  AISLE_ICON,
  AISLES,
  CONTENT_UNITS,
  parseQuantity,
  quantityToInput,
  type Aisle,
  type ContentUnit,
  type Product,
  type ProductInput,
  type Unit,
} from "@/lib/grocery-logic";
import { useTranslations } from "@/i18n";

import { Field } from "./common";
import { Segmented } from "./Segmented";
import { Select } from "./Select";
import { TextInput } from "./TextInput";

/** The fields as typed. */
export type ProductDraft = {
  name: string;
  barcode: string;
  unit: Unit;
  aisle: Aisle | "none";
  content: string;
  contentUnit: ContentUnit;
};

export function toProductDraft(product: Product | null): ProductDraft {
  return {
    name: product?.name ?? "",
    barcode: product?.barcode ?? "",
    unit: product?.unit ?? "unit",
    aisle: product?.aisle ?? "none",
    content: product?.contentMilli ? quantityToInput(product.contentMilli) : "",
    contentUnit: product?.contentUnit ?? "l",
  };
}

/** What to send, or `null` when the content isn't a number. */
export function draftToInput(draft: ProductDraft): ProductInput | null {
  const contentMilli = draft.content.trim()
    ? parseQuantity(draft.content)
    : null;
  if (draft.content.trim() && !contentMilli) return null;
  return {
    name: draft.name,
    barcode: draft.barcode,
    unit: draft.unit,
    aisle: draft.aisle === "none" ? null : draft.aisle,
    contentMilli: draft.unit === "unit" ? contentMilli : null,
    contentUnit: draft.contentUnit,
  };
}

export function ProductFields({
  draft,
  onChange,
  autoFocus = false,
}: {
  draft: ProductDraft;
  onChange: (draft: ProductDraft) => void;
  autoFocus?: boolean;
}) {
  const messages = useTranslations();
  const t = messages.product;
  const set = (patch: Partial<ProductDraft>) =>
    onChange({ ...draft, ...patch });

  return (
    <>
      <Field label={t.name}>
        <TextInput
          autoFocus={autoFocus}
          value={draft.name}
          onChange={(e) => set({ name: e.target.value })}
        />
      </Field>
      <Field label={t.barcode}>
        <TextInput
          className="num"
          inputMode="numeric"
          value={draft.barcode}
          onChange={(e) => set({ barcode: e.target.value })}
        />
      </Field>
      <Segmented
        aria-label={t.unit.unit}
        options={[
          { value: "unit", label: t.unit.unit },
          { value: "kg", label: t.unit.kg },
        ]}
        value={draft.unit}
        onChange={(unit) => set({ unit })}
      />
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted">{t.aisle}</span>
        <Select
          aria-label={t.aisle}
          className="w-full sm:w-64"
          value={draft.aisle}
          onChange={(v) => set({ aisle: v as Aisle | "none" })}
          options={[
            { key: "none", label: t.noAisle },
            ...AISLES.map((a) => ({
              key: a,
              label: `${AISLE_ICON[a]} ${messages.aisles[a]}`,
            })),
          ]}
        />
      </div>
      {draft.unit === "unit" && (
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted">{t.content}</span>
          <div className="flex flex-wrap items-center gap-2">
            <TextInput
              aria-label={t.content}
              inputMode="decimal"
              className="num w-28"
              placeholder="1,5"
              value={draft.content}
              onChange={(e) => set({ content: e.target.value })}
            />
            <Segmented
              aria-label={t.content}
              options={CONTENT_UNITS.map((u) => ({
                value: u,
                label: t.contentUnits[u],
              }))}
              value={draft.contentUnit}
              onChange={(contentUnit) => set({ contentUnit })}
            />
          </div>
          <span className="text-xs text-muted">{t.contentHint}</span>
        </div>
      )}
    </>
  );
}
