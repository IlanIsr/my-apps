"use client";

/**
 * The categories: icon, name, monthly budget, hidden or not. A default
 * category keeps its translated name until renamed. New ones are added at the
 * end.
 */

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createCategoryAction, updateCategoryAction } from "@/app/actions";
import { categoryLabel, type Category } from "@/lib/expense-logic";
import { centsToInput, parseMoney } from "@/lib/grocery-logic";
import { useTranslations } from "@/i18n";

import { Button } from "./Button";
import { Checkbox } from "./Checkbox";
import { ErrorLine, Field, PageHeader } from "./common";
import { TextInput } from "./TextInput";

export type CategoriesTexts = {
  title: string;
  description: string;
  icon: string;
  name: string;
  budget: string;
  noBudget: string;
  hidden: string;
  save: string;
  add: string;
  newName: string;
};

type Draft = { icon: string; name: string; budget: string; archived: boolean };

const toDraft = (c: Category): Draft => ({
  icon: c.icon,
  name: c.name ?? "",
  budget: c.budget === null ? "" : centsToInput(c.budget),
  archived: c.archived,
});

function CategoryRow({
  category,
  t,
  placeholder,
  onSave,
}: {
  category: Category | null;
  t: CategoriesTexts;
  placeholder: string;
  onSave: (draft: Draft) => Promise<boolean>;
}) {
  const initial = category
    ? toDraft(category)
    : { icon: "🏷️", name: "", budget: "", archived: false };
  const [draft, setDraft] = useState<Draft>(initial);
  const [busy, setBusy] = useState(false);
  const dirty = JSON.stringify(draft) !== JSON.stringify(initial);
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));

  return (
    <li
      className={`grid grid-cols-[3.5rem_1fr] gap-2 p-3 sm:grid-cols-[3.5rem_1fr_8rem_auto_auto] sm:items-end ${
        draft.archived ? "opacity-60" : ""
      }`}
    >
      <Field label={t.icon}>
        <TextInput
          value={draft.icon}
          onChange={(e) => set({ icon: e.target.value })}
          className="text-center text-lg"
        />
      </Field>
      <Field label={t.name}>
        <TextInput
          value={draft.name}
          placeholder={placeholder}
          onChange={(e) => set({ name: e.target.value })}
        />
      </Field>
      <Field label={t.budget} className="col-span-2 sm:col-span-1">
        <TextInput
          inputMode="decimal"
          className="num"
          placeholder={t.noBudget}
          value={draft.budget}
          onChange={(e) => set({ budget: e.target.value })}
        />
      </Field>
      {category ? (
        <Checkbox
          checked={draft.archived}
          onChange={(archived) => set({ archived })}
          className="flex items-center gap-2 text-sm sm:pb-2"
        >
          {t.hidden}
        </Checkbox>
      ) : (
        <span />
      )}
      <Button
        size="sm"
        variant="primary"
        disabled={!dirty || busy || (!category && !draft.name.trim())}
        onClick={async () => {
          setBusy(true);
          const ok = await onSave(draft);
          setBusy(false);
          if (ok && !category) setDraft(initial);
        }}
        className="sm:mb-1"
      >
        {category ? t.save : t.add}
      </Button>
    </li>
  );
}

export function CategoriesView({ categories }: { categories: Category[] }) {
  const messages = useTranslations();
  const t = messages.categories;
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function save(category: Category | null, draft: Draft) {
    setError(null);
    const budget = draft.budget.trim() ? parseMoney(draft.budget) : null;
    if (draft.budget.trim() && budget === null) {
      setError(messages.errors.invalid);
      return false;
    }
    const input = {
      icon: draft.icon.trim() || "🏷️",
      name: draft.name.trim() || null,
      budget,
      archived: draft.archived,
    };
    const result = category
      ? await updateCategoryAction(category.id, input)
      : await createCategoryAction(input);
    if (!result.ok) {
      setError(messages.errors[result.error]);
      return false;
    }
    router.refresh();
    return true;
  }

  return (
    <>
      <PageHeader title={t.title} />
      <p className="mb-4 text-sm text-muted">{t.description}</p>
      <ErrorLine message={error} />
      <ul className="card mt-2 divide-y divide-line">
        {categories.map((c) => (
          <CategoryRow
            key={`${c.id}-${c.name}-${c.budget}-${c.archived}-${c.icon}`}
            category={c}
            t={t}
            placeholder={
              c.key
                ? categoryLabel({ ...c, name: null }, messages.categoryNames)
                : t.newName
            }
            onSave={(draft) => save(c, draft)}
          />
        ))}
        <CategoryRow
          category={null}
          t={t}
          placeholder={t.newName}
          onSave={(draft) => save(null, draft)}
        />
      </ul>
    </>
  );
}
