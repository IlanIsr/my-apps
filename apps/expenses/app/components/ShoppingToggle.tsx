"use client";

/** Adds a product to the shopping list (1 piece / 1 kg), or removes it. */

import { useState } from "react";

import { setShoppingItemAction } from "@/app/actions";

import { Button } from "./Button";

export type ShoppingToggleTexts = { add: string; added: string };

export function ShoppingToggle({
  productId,
  inList,
  t,
}: {
  productId: string;
  inList: boolean;
  t: ShoppingToggleTexts;
}) {
  const [on, setOn] = useState(inList);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    const next = !on;
    setOn(next);
    const result = await setShoppingItemAction(productId, next ? 1000 : 0);
    if (!result.ok) setOn(!next);
    setBusy(false);
  }

  return (
    <Button
      size="sm"
      variant={on ? "primary" : "outline"}
      onClick={toggle}
      disabled={busy}
    >
      {on ? `✓ ${t.added}` : `+ ${t.add}`}
    </Button>
  );
}
