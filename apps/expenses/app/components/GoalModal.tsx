"use client";

/**
 * Add / edit one goal of a month: what it caps (everything, a category or a
 * payment method), the most to spend, an optional name.
 */

import { useRouter } from "next/navigation";
import { useState } from "react";

import { SimpleModal } from "@repo/ui/modal";

import {
  createGoalAction,
  deleteGoalAction,
  updateGoalAction,
} from "@/app/actions";
import {
  categoryLabel,
  GOAL_SCOPES,
  METHOD_ICON,
  METHODS,
  type Category,
  type Goal,
  type GoalScope,
  type Method,
} from "@/lib/expense-logic";
import { centsToInput, parseMoney } from "@/lib/grocery-logic";
import { useTranslations } from "@/i18n";

import { Button } from "./Button";
import { ErrorLine, Field } from "./common";
import { Segmented } from "./Segmented";
import { Select } from "./Select";
import { TextInput } from "./TextInput";

export type GoalModalTexts = {
  addTitle: string;
  editTitle: string;
  scope: string;
  scopes: Record<GoalScope, string>;
  category: string;
  method: string;
  amount: string;
  name: string;
  namePlaceholder: string;
  save: string;
  cancel: string;
  delete: string;
  badAmount: string;
};

export function GoalModal({
  goal,
  month,
  categories,
  onClose,
}: {
  /** `null` = a new goal for `month`. */
  goal: Goal | null;
  month: string;
  categories: Category[];
  onClose: () => void;
}) {
  const messages = useTranslations();
  const t = messages.goalModal;
  const router = useRouter();
  const shown = categories.filter(
    (c) => !c.archived || c.id === goal?.categoryId,
  );

  const [scope, setScope] = useState<GoalScope>(goal?.scope ?? "total");
  const [categoryId, setCategoryId] = useState(
    goal?.categoryId ?? shown[0]?.id ?? "",
  );
  const [method, setMethod] = useState<Method>(goal?.method ?? "cash");
  const [amount, setAmount] = useState(goal ? centsToInput(goal.amount) : "");
  const [name, setName] = useState(goal?.name ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save() {
    const cents = parseMoney(amount);
    if (!cents) return setError(t.badAmount);
    setBusy(true);
    setError(null);
    const input = {
      month: goal?.month ?? month,
      scope,
      categoryId: scope === "category" ? categoryId : null,
      method: scope === "method" ? method : null,
      amount: cents,
      name: name.trim() || null,
    };
    const result = goal
      ? await updateGoalAction(goal.id, input)
      : await createGoalAction(input);
    setBusy(false);
    if (!result.ok) return setError(messages.errors[result.error]);
    router.refresh();
    onClose();
  }

  async function remove() {
    if (!goal) return;
    setBusy(true);
    const result = await deleteGoalAction(goal.id);
    setBusy(false);
    if (!result.ok) return setError(messages.errors[result.error]);
    router.refresh();
    onClose();
  }

  return (
    <SimpleModal
      isOpen
      onClose={onClose}
      isDismissable={!busy}
      title={goal ? t.editTitle : t.addTitle}
      footer={
        <div className="flex w-full flex-wrap items-center gap-2">
          {goal && (
            <Button variant="danger" onClick={remove} disabled={busy}>
              {t.delete}
            </Button>
          )}
          <div className="ms-auto flex gap-2">
            <Button onClick={onClose} disabled={busy}>
              {t.cancel}
            </Button>
            <Button variant="primary" onClick={save} disabled={busy}>
              {t.save}
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted">{t.scope}</span>
          <Segmented
            aria-label={t.scope}
            options={GOAL_SCOPES.map((s) => ({ value: s, label: t.scopes[s] }))}
            value={scope}
            onChange={setScope}
          />
        </div>
        {scope === "category" && (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted">{t.category}</span>
            <Select
              aria-label={t.category}
              className="w-full"
              value={categoryId}
              onChange={setCategoryId}
              options={shown.map((c) => ({
                key: c.id,
                label: `${c.icon} ${categoryLabel(c, messages.categoryNames)}`,
              }))}
            />
          </div>
        )}
        {scope === "method" && (
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
        )}
        <Field label={t.amount}>
          <TextInput
            inputMode="decimal"
            autoFocus={!goal}
            placeholder="0,00"
            className="num text-2xl"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </Field>
        <Field label={t.name}>
          <TextInput
            placeholder={t.namePlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <ErrorLine message={error} />
      </div>
    </SimpleModal>
  );
}
