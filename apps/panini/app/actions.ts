"use server";

/**
 * Server actions for the album. Each one resolves the signed-in Clerk user,
 * validates its input (`lib/validate.ts`), calls the store — which scopes every
 * query to that user's own album — and maps failures to a stable error code.
 * Mutations return the fresh album so the client can replace its state.
 */

import { getCurrentUserId } from "@repo/auth/user";

import { DatabaseNotConfiguredError } from "@/db/client";
import { LIMITS, type Album, type ImportEntry } from "@/lib/album-logic";
import * as store from "@/lib/store";
import * as v from "@/lib/validate";

export type ActionErrorCode =
  | store.AlbumErrorCode
  | "not-signed-in"
  | "invalid"
  | "db-not-configured"
  | "unknown";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ActionErrorCode };

class NotSignedInError extends Error {}

async function run<T>(
  fn: (ownerId: string) => Promise<T>,
): Promise<ActionResult<T>> {
  try {
    const ownerId = await getCurrentUserId();
    if (!ownerId) throw new NotSignedInError();
    return { ok: true, data: await fn(ownerId) };
  } catch (error) {
    if (error instanceof NotSignedInError) {
      return { ok: false, error: "not-signed-in" };
    }
    if (error instanceof store.AlbumError) return { ok: false, error: error.code };
    if (error instanceof v.InvalidInputError) {
      return { ok: false, error: "invalid" };
    }
    if (error instanceof DatabaseNotConfiguredError) {
      return { ok: false, error: "db-not-configured" };
    }
    console.error("[panini] action failed:", error);
    return { ok: false, error: "unknown" };
  }
}

/** Runs a mutation, then returns the user's fresh album. */
function mutate(
  fn: (ownerId: string) => Promise<unknown>,
): Promise<ActionResult<Album | null>> {
  return run(async (ownerId) => {
    await fn(ownerId);
    return store.getAlbum(ownerId);
  });
}

export async function createAlbumAction(input: {
  name: string;
  total: number;
  perPage: number;
  kids: string[];
  reserveName: string;
}) {
  return mutate((ownerId) => {
    if (!Array.isArray(input.kids) || input.kids.length > LIMITS.collectors) {
      throw new v.InvalidInputError("kids");
    }
    return store.createAlbum(ownerId, {
      name: v.text(input.name, "name", LIMITS.name),
      total: v.int(input.total, "total", 1, LIMITS.totalCards),
      perPage: v.int(input.perPage, "perPage", 1, LIMITS.perPage),
      kids: input.kids.map((k) => v.text(k, "kid", LIMITS.name)),
      reserveName: v.text(input.reserveName, "reserveName", LIMITS.name),
    });
  });
}

/** Hot path (every +/− tap) — returns just the new count, not the album. */
export async function stepCountAction(
  cardId: string,
  collectorId: string,
  delta: 1 | -1,
) {
  return run((ownerId) => {
    if (delta !== 1 && delta !== -1) throw new v.InvalidInputError("delta");
    return store.stepCount(
      ownerId,
      v.id(cardId),
      v.id(collectorId),
      delta,
    );
  });
}

export async function addCardAction(input: ImportEntry) {
  return mutate((ownerId) => store.addCard(ownerId, v.cardEntry(input)));
}

export async function updateCardAction(
  cardId: string,
  input: { page: number; label: string },
) {
  return mutate((ownerId) =>
    store.updateCard(ownerId, v.id(cardId), {
      page: v.int(input.page, "page", 1, LIMITS.page),
      label: v.text(input.label, "label", LIMITS.label, { required: false }),
    }),
  );
}

export async function deleteCardAction(cardId: string) {
  return mutate((ownerId) => store.deleteCard(ownerId, v.id(cardId)));
}

export async function importCardsAction(entries: ImportEntry[]) {
  let summary = { added: 0, updated: 0 };
  const result = await mutate(async (ownerId) => {
    if (
      !Array.isArray(entries) ||
      !entries.length ||
      entries.length > LIMITS.totalCards
    ) {
      throw new v.InvalidInputError("entries");
    }
    summary = await store.importCards(ownerId, entries.map(v.cardEntry));
  });
  return result.ok ? { ...result, summary } : result;
}

export async function bulkAddCardsAction(count: number) {
  return mutate((ownerId) =>
    store.bulkAddCards(ownerId, v.int(count, "count", 1, LIMITS.bulkAdd)),
  );
}

export async function updateSettingsAction(input: {
  name: string;
  perPage: number;
}) {
  return mutate((ownerId) =>
    store.updateSettings(ownerId, {
      name: v.text(input.name, "name", LIMITS.name),
      perPage: v.int(input.perPage, "perPage", 1, LIMITS.perPage),
    }),
  );
}

export async function resetAlbumAction() {
  return mutate((ownerId) => store.resetAlbum(ownerId));
}

export async function addCollectorAction(input: {
  name: string;
  color: string;
}) {
  return mutate((ownerId) =>
    store.addCollector(ownerId, {
      name: v.text(input.name, "name", LIMITS.name),
      color: v.color(input.color),
    }),
  );
}

export async function updateCollectorAction(
  collectorId: string,
  input: { name: string; color: string },
) {
  return mutate((ownerId) =>
    store.updateCollector(ownerId, v.id(collectorId), {
      name: v.text(input.name, "name", LIMITS.name),
      color: v.color(input.color),
    }),
  );
}

export async function deleteCollectorAction(collectorId: string) {
  return mutate((ownerId) =>
    store.deleteCollector(ownerId, v.id(collectorId)),
  );
}

export async function setPageRewardAction(input: unknown) {
  return mutate((ownerId) => store.setPageReward(ownerId, v.reward(input)));
}

export async function deletePageRewardAction(page: number) {
  return mutate((ownerId) =>
    store.deletePageReward(ownerId, v.int(page, "page", 1, LIMITS.page)),
  );
}
