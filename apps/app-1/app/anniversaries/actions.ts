"use server";

import { revalidatePath } from "next/cache";

import { MESSAGES } from "@/i18n/messages";
import type { Locale } from "@/i18n/config";
import {
  createAnniversaryEvents,
  deleteAnniversaryEvents,
  deleteEvent,
  GoogleCalendarNotConnectedError,
  updateAnniversaryEvent,
} from "@/server/calendar";

export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | { ok: false; error: "not-connected" | string };

function fail(error: unknown): { ok: false; error: "not-connected" | string } {
  if (error instanceof GoogleCalendarNotConnectedError) {
    return { ok: false, error: "not-connected" };
  }
  return { ok: false, error: error instanceof Error ? error.message : "unknown" };
}

export async function createAnniversaryAction(input: {
  name: string;
  hebDay: number;
  hebMonth: string;
  shared: string[];
  years: number;
  locale: Locale;
}): Promise<ActionResult<{ count: number }>> {
  try {
    const summary = MESSAGES[input.locale].calendar.eventSummary(input.name);
    const created = await createAnniversaryEvents({ ...input, summary });
    revalidatePath("/anniversaries");
    return { ok: true, data: { count: created.length } };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteAnniversaryAction(
  id: string,
): Promise<ActionResult<{ count: number }>> {
  try {
    const count = await deleteAnniversaryEvents(id);
    revalidatePath("/anniversaries");
    revalidatePath(`/anniversaries/${id}`);
    return { ok: true, data: { count } };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteEventAction(
  id: string,
  eventId: string,
): Promise<ActionResult> {
  try {
    await deleteEvent(eventId);
    revalidatePath(`/anniversaries/${id}`);
    revalidatePath("/anniversaries");
    return { ok: true };
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
  shared: string[];
  locale: Locale;
}): Promise<ActionResult> {
  try {
    const summary = MESSAGES[input.locale].calendar.eventSummary(input.name);
    await updateAnniversaryEvent({ ...input, summary });
    revalidatePath(`/anniversaries/${input.id}`);
    revalidatePath("/anniversaries");
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}
