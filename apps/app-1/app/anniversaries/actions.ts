"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUserEmail, getCurrentUserId } from "@repo/auth/user";

import { getDictionary, type Locale } from "@/i18n";
import {
  addAnniversary,
  CalendarNotConfiguredError,
  CalendarRateLimitError,
  leaveAnniversary,
  NoSuchHebrewDateError,
  StoreNotConfiguredError,
  updateEvent,
} from "@repo/anniversaries";

export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | {
      ok: false;
      error: "not-configured" | "not-signed-in" | "no-such-date" | string;
    };

function fail(error: unknown): { ok: false; error: string } {
  if (
    error instanceof CalendarNotConfiguredError ||
    error instanceof StoreNotConfiguredError
  ) {
    return { ok: false, error: "not-configured" };
  }
  if (error instanceof NoSuchHebrewDateError) {
    return { ok: false, error: "no-such-date" };
  }
  if (error instanceof CalendarRateLimitError) {
    return { ok: false, error: "rate-limited" };
  }
  return { ok: false, error: error instanceof Error ? error.message : "unknown" };
}

function refreshAnniversaries(id?: string) {
  revalidatePath("/anniversaries");
  revalidatePath("/calendar");
  if (id) revalidatePath(`/anniversaries/${id}`);
}

export async function addAnniversaryAction(input: {
  name: string;
  hebDay: number;
  hebMonth: string;
  years: number;
  sharedEmails: string[];
  hebrewName?: string;
  origin?: string;
  locale: Locale;
}): Promise<ActionResult<{ created: number; joined: boolean }>> {
  try {
    const [email, userId] = await Promise.all([
      getCurrentUserEmail(),
      getCurrentUserId(),
    ]);
    if (!email || !userId) return { ok: false, error: "not-signed-in" };

    const summary = getDictionary(input.locale).eventSummary.format(input.name);
    const data = await addAnniversary(
      { ...input, summary, createdBy: userId },
      email,
    );
    refreshAnniversaries();
    return { ok: true, data };
  } catch (error) {
    return fail(error);
  }
}

export async function leaveAnniversaryAction(
  id: string,
): Promise<ActionResult<{ removed: number; deleted: number }>> {
  try {
    const email = await getCurrentUserEmail();
    if (!email) return { ok: false, error: "not-signed-in" };

    const data = await leaveAnniversary(id, email);
    refreshAnniversaries(id);
    return { ok: true, data };
  } catch (error) {
    return fail(error);
  }
}

export async function updateEventAction(input: {
  id: string;
  eventId: string;
  name: string;
  hebDateLabel: string;
  date: string;
  time?: string;
  locale: Locale;
}): Promise<ActionResult> {
  try {
    const summary = getDictionary(input.locale).eventSummary.format(input.name);
    await updateEvent({ ...input, summary });
    refreshAnniversaries(input.id);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}
