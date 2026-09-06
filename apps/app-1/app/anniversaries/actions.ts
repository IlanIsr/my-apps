"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUserEmail, getCurrentUserId } from "@repo/auth/user";

import { getDictionary, type Locale } from "@/i18n";
import {
  addAnniversary,
  addMember,
  CalendarNotConfiguredError,
  CalendarRateLimitError,
  leaveAnniversary,
  NoSuchHebrewDateError,
  StoreNotConfiguredError,
  updateAnniversary,
  updateEvent,
  type AnniversaryType,
} from "@repo/anniversaries";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function eventSummaryFor(
  locale: Locale,
  type: AnniversaryType,
  name: string,
): string {
  const t = getDictionary(locale).eventSummary;
  return type === "yahrzeit" ? t.yahrzeit(name) : t.birthday(name);
}

export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | {
      ok: false;
      error: "not-configured" | "not-signed-in" | "no-such-date" | string;
    };

function fail(error: unknown): { ok: false; error: string } {
  if (error instanceof StoreNotConfiguredError) {
    console.error("[anniversaries] database not configured:", error);
    return { ok: false, error: "db-not-configured" };
  }
  if (error instanceof CalendarNotConfiguredError) {
    console.error("[anniversaries] calendar not configured:", error);
    return { ok: false, error: "not-configured" };
  }
  if (error instanceof NoSuchHebrewDateError) {
    return { ok: false, error: "no-such-date" };
  }
  if (error instanceof CalendarRateLimitError) {
    return { ok: false, error: "rate-limited" };
  }
  return {
    ok: false,
    error: error instanceof Error ? error.message : "unknown",
  };
}

function refreshAnniversaries(id?: string) {
  revalidatePath("/anniversaries");
  revalidatePath("/calendar");
  if (id) revalidatePath(`/anniversaries/${id}`);
}

export async function addAnniversaryAction(input: {
  name: string;
  type: AnniversaryType;
  hebDay: number;
  hebMonth: string;
  years: number;
  sharedEmails: string[];
  hebrewName?: string;
  origin?: string;
  hebYear?: number;
  /** Email the family a Google Calendar invite so the events show up for them. */
  notify: boolean;
  locale: Locale;
}): Promise<ActionResult<{ created: number; joined: boolean }>> {
  try {
    const [email, userId] = await Promise.all([
      getCurrentUserEmail(),
      getCurrentUserId(),
    ]);
    if (!email || !userId) return { ok: false, error: "not-signed-in" };

    const summary = eventSummaryFor(input.locale, input.type, input.name);
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

export async function addMemberAction(input: {
  id: string;
  /** The anniversary's current name + type, for the calendar title. */
  name: string;
  type: AnniversaryType;
  email: string;
  notify: boolean;
  locale: Locale;
}): Promise<ActionResult<{ added: boolean; already: boolean }>> {
  try {
    const viewer = await getCurrentUserEmail();
    if (!viewer) return { ok: false, error: "not-signed-in" };
    if (!EMAIL_RE.test(input.email.trim())) {
      return { ok: false, error: "email-invalid" };
    }

    const summary = eventSummaryFor(input.locale, input.type, input.name);
    const data = await addMember(
      { id: input.id, email: input.email, notify: input.notify, summary },
      viewer,
    );
    refreshAnniversaries(input.id);
    return { ok: true, data };
  } catch (error) {
    return fail(error);
  }
}

export async function bulkShareAction(input: {
  email: string;
  items: { id: string; name: string; type: AnniversaryType }[];
  notify: boolean;
  locale: Locale;
}): Promise<
  ActionResult<{
    added: number;
    already: number;
    failed: number;
    rateLimited: boolean;
  }>
> {
  try {
    const viewer = await getCurrentUserEmail();
    if (!viewer) return { ok: false, error: "not-signed-in" };
    if (!EMAIL_RE.test(input.email.trim())) {
      return { ok: false, error: "email-invalid" };
    }
    if (input.items.length === 0) return { ok: false, error: "nothing-selected" };

    let added = 0;
    let already = 0;
    let failed = 0;
    let rateLimited = false;

    for (const item of input.items) {
      const summary = eventSummaryFor(input.locale, item.type, item.name);
      try {
        const result = await addMember(
          { id: item.id, email: input.email, notify: input.notify, summary },
          viewer,
        );
        if (result.added) added++;
        else if (result.already) already++;
        else failed++;
      } catch (error) {
        if (error instanceof CalendarRateLimitError) {
          rateLimited = true;
          break;
        }
        console.error(`[anniversaries] bulk share failed for ${item.id}:`, error);
        failed++;
      }
    }

    refreshAnniversaries();
    return { ok: true, data: { added, already, failed, rateLimited } };
  } catch (error) {
    return fail(error);
  }
}

export async function updatePersonAction(input: {
  id: string;
  /** Current form values — always sent so the title can be recomputed. */
  name: string;
  type: AnniversaryType;
  hebrewName?: string;
  origin?: string;
  hebYear?: number;
  locale: Locale;
}): Promise<ActionResult<{ updated: boolean }>> {
  try {
    const email = await getCurrentUserEmail();
    if (!email) return { ok: false, error: "not-signed-in" };
    if (!input.name.trim()) return { ok: false, error: "name-required" };

    const summary = eventSummaryFor(input.locale, input.type, input.name);
    const data = await updateAnniversary({ ...input, summary }, email);
    refreshAnniversaries(input.id);
    return { ok: true, data };
  } catch (error) {
    return fail(error);
  }
}

export async function updateEventAction(input: {
  id: string;
  eventId: string;
  name: string;
  type: AnniversaryType;
  hebDateLabel: string;
  date: string;
  time?: string;
  locale: Locale;
}): Promise<ActionResult> {
  try {
    const summary = eventSummaryFor(input.locale, input.type, input.name);
    await updateEvent({ ...input, summary });
    refreshAnniversaries(input.id);
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}
